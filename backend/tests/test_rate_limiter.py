
import pytest

from fastapi import HTTPException
from app.rate_limiter import LoginRateLimiter


@pytest.fixture
def limiter():
    return LoginRateLimiter(
        max_attempts=5,
        lockout_duration_seconds=300,
        window_duration_seconds=300
    )


def test_configuracion_inicial(limiter):
    assert limiter.max_attempts == 5
    assert limiter.lockout_duration_seconds == 300
    assert limiter.window_duration_seconds == 300
    assert limiter._attempts == {}


def test_acceso_sin_intentos_fallidos(limiter):
    assert limiter.check_rate_limit("cuenta_prueba") is None


def test_primer_intento_fallido(limiter):
    limiter.record_failed_attempt("cuenta_prueba")

    assert limiter._attempts["cuenta_prueba"][0] == 1


def test_acumulacion_intentos(limiter):
    for _ in range(3):
        limiter.record_failed_attempt("cuenta_prueba")

    assert limiter._attempts["cuenta_prueba"][0] == 3


def test_acceso_antes_del_limite(limiter):
    for _ in range(4):
        limiter.record_failed_attempt("cuenta_prueba")

    assert limiter.check_rate_limit("cuenta_prueba") is None


def test_bloqueo_por_cinco_intentos(limiter):
    for _ in range(5):
        limiter.record_failed_attempt("cuenta_prueba")

    with pytest.raises(HTTPException) as error:
        limiter.check_rate_limit("cuenta_prueba")

    assert error.value.status_code == 429
    assert "bloqueado" in error.value.detail
    assert "Retry-After" in error.value.headers


def test_bloqueo_por_ip(limiter):
    for _ in range(5):
        limiter.record_failed_attempt("ip:127.0.0.1")

    with pytest.raises(HTTPException) as error:
        limiter.check_rate_limit(
            "ip:127.0.0.1",
            "dirección IP"
        )

    assert error.value.status_code == 429
    assert "dirección IP" in error.value.detail


def test_cuentas_independientes(limiter):
    for _ in range(5):
        limiter.record_failed_attempt("cuenta1")

    assert limiter.check_rate_limit("cuenta2") is None


def test_restablecer_intentos(limiter):
    for _ in range(5):
        limiter.record_failed_attempt("cuenta_prueba")

    limiter.reset_attempts("cuenta_prueba")

    assert "cuenta_prueba" not in limiter._attempts
    assert limiter.check_rate_limit("cuenta_prueba") is None


def test_restablecer_cuenta_inexistente(limiter):
    limiter.reset_attempts("cuenta_inexistente")

    assert limiter._attempts == {}


def test_expiracion_ventana(limiter, monkeypatch):
    monkeypatch.setattr(
        "app.rate_limiter.time.time",
        lambda: 1000
    )

    limiter.record_failed_attempt("cuenta_prueba")
    limiter.record_failed_attempt("cuenta_prueba")

    monkeypatch.setattr(
        "app.rate_limiter.time.time",
        lambda: 1301
    )

    limiter.record_failed_attempt("cuenta_prueba")

    assert limiter._attempts["cuenta_prueba"][0] == 1


def test_expiracion_bloqueo(limiter, monkeypatch):
    monkeypatch.setattr(
        "app.rate_limiter.time.time",
        lambda: 1000
    )

    for _ in range(5):
        limiter.record_failed_attempt("cuenta_prueba")

    monkeypatch.setattr(
        "app.rate_limiter.time.time",
        lambda: 1301
    )

    assert limiter.check_rate_limit("cuenta_prueba") is None
    assert "cuenta_prueba" not in limiter._attempts


def test_limpieza_registros_expirados(limiter, monkeypatch):
    monkeypatch.setattr(
        "app.rate_limiter.time.time",
        lambda: 1000
    )

    limiter.record_failed_attempt("cuenta1")
    limiter.record_failed_attempt("cuenta2")

    limiter._cleanup_expired(1301)

    assert limiter._attempts == {}
