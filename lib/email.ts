import { Resend } from 'resend'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { SITE_URL } from '@/lib/config'

const FROM = 'Expert Doi Trans <onboarding@resend.dev>'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

interface EmailData {
  customerName: string
  customerPhone: string
  customerEmail: string
  carName: string
  startDate: string
  endDate: string
  totalPrice: number
  notes: string
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'd MMMM yyyy', { locale: ro })
}

function adminHtml(d: EmailData & { start: string; end: string }) {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr>
          <td style="background:#1e3a5f;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Expert Doi Trans</p>
            <p style="margin:4px 0 0;color:#93c5fd;font-size:13px">Rezervare nouă</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111">🚗 ${esc(d.carName)}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;width:140px">Client</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">${esc(d.customerName)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Telefon</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">
                  <a href="tel:${esc(d.customerPhone)}" style="color:#2563eb;text-decoration:none">${esc(d.customerPhone)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px">${d.customerEmail ? esc(d.customerEmail) : '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Perioadă</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">${esc(d.start)} → ${esc(d.end)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Total estimat</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:16px;color:#2563eb">${d.totalPrice} RON</td>
              </tr>
              ${d.notes ? `<tr>
                <td style="padding:10px 0;color:#555;font-size:14px;vertical-align:top">Mențiuni</td>
                <td style="padding:10px 0;font-size:14px;color:#444">${esc(d.notes)}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:28px;padding:16px;background:#eff6ff;border-radius:8px;border-left:4px solid #2563eb">
              <p style="margin:0;font-size:13px;color:#1e40af">Intră în <a href="${SITE_URL}/admin/dashboard" style="color:#2563eb;font-weight:600">panoul de admin</a> pentru a aproba sau respinge rezervarea.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af">Expert Doi Trans · Alba Iulia, Micești · +40 732 083 657</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function customerHtml(d: { customerName: string; carName: string; start: string; end: string; totalPrice: number }) {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr>
          <td style="background:#1e3a5f;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Expert Doi Trans</p>
            <p style="margin:4px 0 0;color:#93c5fd;font-size:13px">Închirieri Auto · Alba Iulia</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Mulțumim, ${esc(d.customerName)}!</p>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6">Cererea ta de rezervare a fost primită. Te vom contacta telefonic în cel mai scurt timp pentru confirmare.</p>

            <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
              <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#111">${esc(d.carName)}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#555">📅 ${esc(d.start)} → ${esc(d.end)}</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#2563eb">${d.totalPrice} RON <span style="font-size:13px;font-weight:400;color:#888">(estimat, se confirmă la ridicare)</span></p>
            </div>

            <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="margin:0;font-size:13px;color:#166534;line-height:1.5">✓ Rezervarea va fi confirmată telefonic<br>✓ Nu se percepe avans la această etapă<br>✓ Prețul final se stabilește la ridicarea mașinii</p>
            </div>

            <p style="margin:0;font-size:14px;color:#555">Ai întrebări? Sună-ne:</p>
            <a href="tel:+40732083657" style="display:inline-block;margin-top:10px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">+40 732 083 657</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af">Expert Doi Trans · Alba Iulia, Micești · ${SITE_URL.replace('https://', '')}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface ContactEmailData {
  name: string
  phone: string
  email: string
  message: string
  type?: 'tractari' | 'inchirieri'
}

function contactHtml(d: ContactEmailData) {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr>
          <td style="background:#14532d;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Expert Doi Trans</p>
            <p style="margin:4px 0 0;color:#86efac;font-size:13px">Formular contact tractări</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111">🚛 Cerere nouă</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;width:140px">Nume</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">${esc(d.name)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Telefon</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">
                  <a href="tel:${esc(d.phone)}" style="color:#16a34a;text-decoration:none">${esc(d.phone)}</a>
                </td>
              </tr>
              ${d.email ? `<tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px">${esc(d.email)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:10px 0;color:#555;font-size:14px;vertical-align:top">Mesaj</td>
                <td style="padding:10px 0;font-size:14px;color:#444;line-height:1.6">${esc(d.message).replace(/\n/g, '<br>')}</td>
              </tr>
            </table>
            <div style="margin-top:28px;padding:16px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a">
              <p style="margin:0;font-size:13px;color:#166534">Intră în <a href="${SITE_URL}/admin/contact" style="color:#16a34a;font-weight:600">panoul de admin</a> pentru a vedea și marca cererea ca rezolvată.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af">Expert Doi Trans · Alba Iulia, Micești · +40 732 083 657</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendContactEmail(data: ContactEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  if (!apiKey || !adminEmail) return

  const resend = new Resend(apiKey)
  const emoji = data.type === 'inchirieri' ? '🚗' : '🚛'
  const label = data.type === 'inchirieri' ? 'Cerere contact închirieri' : 'Cerere tractare'
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `${emoji} ${label}: ${data.name} — ${data.phone}`,
    html: contactHtml(data),
  })
}

export async function sendReservationEmails(data: EmailData) {
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  if (!apiKey || !adminEmail) return

  const resend = new Resend(apiKey)
  const start = formatDate(data.startDate)
  const end = formatDate(data.endDate)

  // Admin notification — always sent
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `🚗 Rezervare nouă: ${data.carName} — ${data.customerName}`,
    html: adminHtml({ ...data, start, end }),
  })

  // Customer confirmation — activat după verificarea domeniului în Resend
  // if (data.customerEmail) {
  //   await resend.emails.send({ from: FROM, to: data.customerEmail, ... })
  // }
}
