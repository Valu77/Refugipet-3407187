"""
RefugiPet - Servicio de envío de correos electrónicos
======================================================
Lee credenciales EXCLUSIVAMENTE desde variables de entorno (SMTP_*).
Nunca registra ni expone tokens, contraseñas ni correos en logs.
Soporta TLS (STARTTLS en puerto 587) y SSL directo (puerto 465).
Compatible con Gmail, Outlook, Brevo (Sendinblue), Mailgun y otros.
"""

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Tuple


# ──────────────────────────────────────────────────────────────
# VERIFICACIÓN DE CONFIGURACIÓN
# ──────────────────────────────────────────────────────────────

def smtp_configurado() -> bool:
    """Devuelve True si las variables mínimas de SMTP están definidas."""
    host     = (os.getenv("SMTP_HOST")     or "").strip()
    user     = (os.getenv("SMTP_USER")     or "").strip()
    password = (os.getenv("SMTP_PASSWORD") or "").strip()
    return bool(host and user and password)


def obtener_frontend_url() -> str:
    return (os.getenv("FRONTEND_URL") or "http://localhost:5173").rstrip("/")


def diagnosticar_smtp() -> dict:
    """
    Devuelve un dict con el estado de cada variable SMTP.
    No revela los valores reales — solo si están configurados.
    Útil para un endpoint de diagnóstico en desarrollo.
    """
    host     = (os.getenv("SMTP_HOST")     or "").strip()
    port     = (os.getenv("SMTP_PORT")     or "587").strip()
    user     = (os.getenv("SMTP_USER")     or "").strip()
    password = (os.getenv("SMTP_PASSWORD") or "").strip()
    from_    = (os.getenv("SMTP_FROM")     or "").strip()
    ssl_mode = (os.getenv("SMTP_SSL")      or "false").strip().lower()
    use_tls  = (os.getenv("SMTP_USE_TLS") or "true").strip().lower()
    frontend = obtener_frontend_url()

    return {
        "smtp_configurado": smtp_configurado(),
        "SMTP_HOST":        bool(host),
        "SMTP_PORT":        port,
        "SMTP_USER":        bool(user),
        "SMTP_PASSWORD":    bool(password),
        "SMTP_FROM":        bool(from_),
        "SMTP_SSL":         ssl_mode in {"1", "true", "yes", "si"},
        "SMTP_USE_TLS":     use_tls  in {"1", "true", "yes", "si"},
        "FRONTEND_URL":     frontend,
    }


# ──────────────────────────────────────────────────────────────
# PLANTILLA HTML DEL CORREO DE RECUPERACIÓN
# ──────────────────────────────────────────────────────────────

_PLANTILLA_HTML = """\
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña - RefugiPet</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%%;">

          <!-- CABECERA -->
          <tr>
            <td style="background:linear-gradient(135deg,#e07b54,#c8552a);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:1.6rem;font-weight:700;
                          letter-spacing:-0.5px;">🐾 RefugiPet</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">
                Plataforma de adopción de mascotas
              </p>
            </td>
          </tr>

          <!-- CUERPO -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:1.25rem;font-weight:700;">
                Hola, {nombre_usuario} 👋
              </h2>
              <p style="margin:0 0 20px;color:#4a4a6a;line-height:1.6;font-size:0.95rem;">
                Recibimos una solicitud para <strong>restablecer la contraseña</strong>
                de tu cuenta en RefugiPet.
              </p>
              <p style="margin:0 0 28px;color:#4a4a6a;line-height:1.6;font-size:0.95rem;">
                Haz clic en el botón a continuación para crear una nueva contraseña.
                Este enlace es de <strong>un solo uso</strong> y expira en
                <strong>30 minutos</strong>.
              </p>

              <!-- BOTÓN -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="{enlace_recuperacion}"
                       style="display:inline-block;background:#e07b54;color:#ffffff;
                              text-decoration:none;font-weight:700;font-size:1rem;
                              padding:14px 36px;border-radius:8px;
                              letter-spacing:0.3px;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ENLACE ALTERNATIVO -->
              <p style="margin:0 0 8px;color:#6b6b8a;font-size:0.82rem;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 28px;word-break:break-all;">
                <a href="{enlace_recuperacion}"
                   style="color:#e07b54;font-size:0.82rem;text-decoration:underline;">
                  {enlace_recuperacion}
                </a>
              </p>

              <!-- AVISO DE SEGURIDAD -->
              <div style="background:#fff8f5;border-left:4px solid #e07b54;
                           border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:8px;">
                <p style="margin:0;color:#5a3a1a;font-size:0.85rem;line-height:1.5;">
                  🔒 <strong>¿No solicitaste este cambio?</strong> Puedes ignorar
                  este correo de forma segura. Tu contraseña no cambiará.
                </p>
              </div>
            </td>
          </tr>

          <!-- PIE -->
          <tr>
            <td style="background:#f8f9fb;padding:20px 40px;text-align:center;
                        border-top:1px solid #ececf0;">
              <p style="margin:0;color:#9898b0;font-size:0.78rem;line-height:1.5;">
                Enviado por <strong>RefugiPet</strong> — Plataforma de adopción responsable.<br>
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


# ──────────────────────────────────────────────────────────────
# FUNCIÓN PRINCIPAL DE ENVÍO
# ──────────────────────────────────────────────────────────────

def enviar_correo_recuperacion(
    destinatario: str,
    nombre_usuario: str,
    enlace_recuperacion: str
) -> Tuple[bool, str]:
    """
    Envía correo HTML+texto con el enlace seguro de recuperación.

    Lee credenciales EXCLUSIVAMENTE desde variables de entorno:
      SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM,
      SMTP_USE_TLS (STARTTLS en puerto 587 — recomendado Gmail),
      SMTP_SSL      (SSL directo en puerto 465 — alternativa).

    Nunca registra tokens ni contraseñas en logs o respuestas.
    Devuelve (True, "Correo enviado") o (False, "motivo del error").
    """
    if not smtp_configurado():
        return False, "SMTP no configurado en variables de entorno"

    host      = os.getenv("SMTP_HOST",     "").strip()
    port      = int(os.getenv("SMTP_PORT", "587"))
    user      = os.getenv("SMTP_USER",     "").strip()
    password  = os.getenv("SMTP_PASSWORD", "").strip()
    remitente = (os.getenv("SMTP_FROM") or user).strip()

    # SMTP_SSL=true → SSL directo (puerto 465)
    # SMTP_USE_TLS=true → STARTTLS (puerto 587) — predeterminado Gmail
    use_ssl = os.getenv("SMTP_SSL", "false").strip().lower() in {"1", "true", "yes", "si"}
    use_tls = os.getenv("SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes", "si"}

    # ── Construir mensaje MIME ──
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "RefugiPet — Restablece tu contraseña"
    msg["From"]    = remitente
    msg["To"]      = destinatario

    # Parte texto plano (fallback para clientes sin HTML)
    texto_plano = (
        f"Hola {nombre_usuario},\n\n"
        "Recibimos una solicitud para restablecer tu contraseña en RefugiPet.\n"
        "Haz clic en el siguiente enlace (válido por 30 minutos, un solo uso):\n\n"
        f"{enlace_recuperacion}\n\n"
        "Si no realizaste esta solicitud, ignora este correo de forma segura.\n\n"
        "Equipo RefugiPet"
    )
    parte_texto = MIMEText(texto_plano, "plain", "utf-8")
    parte_html  = MIMEText(
        _PLANTILLA_HTML.format(
            nombre_usuario=nombre_usuario,
            enlace_recuperacion=enlace_recuperacion
        ),
        "html",
        "utf-8"
    )

    # El cliente de correo elige la mejor versión disponible (HTML > texto)
    msg.attach(parte_texto)
    msg.attach(parte_html)

    # ── Enviar ──
    try:
        if use_ssl:
            # SSL directo (ej: puerto 465)
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(host, port, context=context, timeout=15) as server:
                server.login(user, password)
                server.send_message(msg)
        else:
            # STARTTLS (ej: Gmail puerto 587 — recomendado)
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.ehlo()
                if use_tls:
                    context = ssl.create_default_context()
                    server.starttls(context=context)
                    server.ehlo()
                server.login(user, password)
                server.send_message(msg)

        return True, "Correo enviado"

    except smtplib.SMTPAuthenticationError:
        return False, "Error de autenticación SMTP — verifica SMTP_USER y SMTP_PASSWORD"
    except smtplib.SMTPConnectError:
        return False, f"No se pudo conectar con {host}:{port}"
    except smtplib.SMTPRecipientsRefused:
        return False, "El servidor rechazó el destinatario"
    except TimeoutError:
        return False, f"Tiempo de espera agotado al conectar con {host}:{port}"
    except Exception as exc:
        # Solo el tipo de error — nunca el mensaje completo (podría contener datos sensibles)
        return False, f"Error SMTP inesperado: {type(exc).__name__}"
