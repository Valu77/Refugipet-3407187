import time
import threading
from typing import Dict, Tuple
from fastapi import HTTPException, status


class LoginRateLimiter:
    """
    Controlador de tasa de intentos de inicio de sesión para mitigar ataques
    de fuerza bruta y relleno de credenciales.
    Registra intentos fallidos por dirección IP y por correo electrónico.
    """

    def __init__(
        self,
        max_attempts: int = 5,
        lockout_duration_seconds: int = 300,  # 5 minutos de bloqueo
        window_duration_seconds: int = 300   # Ventana de 5 minutos
    ):
        self.max_attempts = max_attempts
        self.lockout_duration_seconds = lockout_duration_seconds
        self.window_duration_seconds = window_duration_seconds
        self._lock = threading.Lock()
        # Clave -> (intentos_fallidos, marca_tiempo_primer_intento, bloqueado_hasta)
        self._attempts: Dict[str, Tuple[int, float, float]] = {}

    def check_rate_limit(self, key: str, tipo_entidad: str = "cuenta"):
        """
        Verifica si la clave está actualmente bloqueada.
        Lanza HTTPException(429) si los intentos exceden el límite.
        """
        now = time.time()
        with self._lock:
            self._cleanup_expired(now)
            if key in self._attempts:
                count, first_time, locked_until = self._attempts[key]
                if now < locked_until:
                    remaining_seconds = int(locked_until - now) + 1
                    remaining_minutes = max(1, (remaining_seconds + 59) // 60)
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=(
                            "Demasiados intentos fallidos de inicio de sesión. "
                            f"Por seguridad, el acceso a esta {tipo_entidad} "
                            "está temporalmente bloqueado. "
                            f"Por favor, inténtelo de nuevo en "
                            f"{remaining_minutes} minuto(s)."
                        ),
                        headers={"Retry-After": str(remaining_seconds)}
                    )

    def record_failed_attempt(self, key: str):
        """
        Registra un intento fallido. Si se alcanza el umbral, bloquea la clave.
        """
        now = time.time()
        with self._lock:
            if key not in self._attempts:
                self._attempts[key] = (1, now, 0.0)
            else:
                count, first_time, locked_until = self._attempts[key]
                # Si la ventana de tiempo expiró y no estaba bloqueado, reiniciar conteo
                if now - first_time > self.window_duration_seconds and now >= locked_until:
                    self._attempts[key] = (1, now, 0.0)
                else:
                    new_count = count + 1
                    if new_count >= self.max_attempts:
                        self._attempts[key] = (
                            new_count,
                            first_time,
                            now + self.lockout_duration_seconds
                        )
                    else:
                        self._attempts[key] = (new_count, first_time, 0.0)

    def reset_attempts(self, key: str):
        """
        Restablece los intentos tras un inicio de sesión exitoso.
        """
        with self._lock:
            self._attempts.pop(key, None)

    def _cleanup_expired(self, now: float):
        """
        Elimina registros antiguos expirados para liberar memoria.
        """
        keys_to_delete = []
        for k, (count, first_time, locked_until) in self._attempts.items():
            if now > locked_until and (now - first_time > self.window_duration_seconds):
                keys_to_delete.append(k)
        for k in keys_to_delete:
            del self._attempts[k]


login_rate_limiter = LoginRateLimiter(
    max_attempts=5,
    lockout_duration_seconds=300,
    window_duration_seconds=300
)

# Control de tasa para solicitudes de recuperación de contraseña (máx 5 en 15 min)
password_reset_rate_limiter = LoginRateLimiter(
    max_attempts=5,
    lockout_duration_seconds=900,
    window_duration_seconds=900
)
