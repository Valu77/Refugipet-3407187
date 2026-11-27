"""
RefugiPet — Script de prueba de envío SMTP
===========================================
Uso:
  1. Configura las variables de entorno en backend/.env  (ver instrucciones abajo)
  2. Desde la carpeta backend/ ejecuta:
       python test_smtp.py tu_correo_destino@gmail.com

Este script carga el .env automáticamente y llama a la misma función
que usa el backend, así puedes verificar que el correo funciona
antes de hacer la prueba completa de recuperación de contraseña.

NO modifiques este script con credenciales reales escritas directamente.
Siempre usa el archivo .env.
"""

import os
import sys

# ── Cargar .env automáticamente si existe ──────────────────────
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env_path):
    with open(_env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                clave, _, valor = line.partition("=")
                # Solo establece si no está ya en el entorno
                os.environ.setdefault(clave.strip(), valor.strip())
    print(f"✅ Cargado: {_env_path}")
else:
    print(f"⚠️  No se encontró {_env_path} — usando variables del sistema")

# ── Importar el servicio de correo ────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))
from app.email_service import (
    smtp_configurado,
    diagnosticar_smtp,
    enviar_correo_recuperacion,
    obtener_frontend_url,
)

# ── Mostrar diagnóstico ───────────────────────────────────────
print("\n📋 Estado de configuración SMTP:")
diag = diagnosticar_smtp()
for k, v in diag.items():
    icon = "✅" if v else ("⚠️ " if k not in ("SMTP_FROM",) else "ℹ️ ")
    print(f"   {icon} {k}: {v}")

if not smtp_configurado():
    print(
        "\n❌  SMTP no configurado. Revisa las variables en backend/.env\n"
        "   Necesitas: SMTP_HOST, SMTP_USER, SMTP_PASSWORD\n"
    )
    sys.exit(1)

# ── Destino del correo de prueba ──────────────────────────────
if len(sys.argv) >= 2:
    destino = sys.argv[1].strip()
else:
    destino = input("\n📧 ¿A qué correo quieres enviar la prueba? ").strip()

if not destino or "@" not in destino:
    print("❌  Correo de destino inválido.")
    sys.exit(1)

# ── Enlace de prueba (no es un token real) ────────────────────
enlace_prueba = (
    f"{obtener_frontend_url()}/restablecer-password"
    "?token=TOKEN_DE_PRUEBA_NO_ES_REAL_123456"
)

print(f"\n📤 Enviando correo de prueba a: {destino}")
print(f"   Enlace de prueba: {enlace_prueba[:60]}...")

exito, mensaje = enviar_correo_recuperacion(
    destinatario=destino,
    nombre_usuario="Usuario de prueba",
    enlace_recuperacion=enlace_prueba,
)

print()
if exito:
    print("✅  ¡Correo enviado exitosamente!")
    print(f"   Revisa la bandeja de entrada (y spam) de: {destino}")
    print(
        "\n🎯 Siguiente paso: prueba el flujo completo en la web:\n"
        "   1. Abre http://localhost:5173/olvide-password\n"
        "   2. Ingresa un correo registrado en RefugiPet\n"
        "   3. Revisa el correo y haz clic en el enlace\n"
        "   4. Establece la nueva contraseña\n"
        "   5. Inicia sesión con la nueva contraseña\n"
    )
else:
    print(f"❌  Error al enviar: {mensaje}")
    print("\n🔧 Pasos para solucionar problemas Gmail:")
    print("   1. Verifica que SMTP_USER sea tu correo Gmail completo")
    print("   2. Verifica que SMTP_PASSWORD sea tu Contraseña de aplicación")
    print("      (no tu contraseña normal — ver instrucciones en la guía)")
    print("   3. Verifica que SMTP_HOST=smtp.gmail.com y SMTP_PORT=587")
    print("   4. Verifica que SMTP_USE_TLS=true")
    sys.exit(1)
