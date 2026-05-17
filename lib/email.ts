import { Resend } from 'resend'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Expert Doi Trans <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!

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
            <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111">🚗 ${d.carName}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;width:140px">Client</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">${d.customerName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Telefon</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">
                  <a href="tel:${d.customerPhone}" style="color:#2563eb;text-decoration:none">${d.customerPhone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px">${d.customerEmail || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Perioadă</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px">${d.start} → ${d.end}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px">Total estimat</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:700;font-size:16px;color:#2563eb">${d.totalPrice} RON</td>
              </tr>
              ${d.notes ? `<tr>
                <td style="padding:10px 0;color:#555;font-size:14px;vertical-align:top">Mențiuni</td>
                <td style="padding:10px 0;font-size:14px;color:#444">${d.notes}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:28px;padding:16px;background:#eff6ff;border-radius:8px;border-left:4px solid #2563eb">
              <p style="margin:0;font-size:13px;color:#1e40af">Intră în <a href="https://inchirieri.vercel.app/admin/dashboard" style="color:#2563eb;font-weight:600">panoul de admin</a> pentru a aproba sau respinge rezervarea.</p>
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
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Mulțumim, ${d.customerName}!</p>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6">Cererea ta de rezervare a fost primită. Te vom contacta telefonic în cel mai scurt timp pentru confirmare.</p>

            <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
              <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#111">${d.carName}</p>
              <p style="margin:0 0 6px;font-size:14px;color:#555">📅 ${d.start} → ${d.end}</p>
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
            <p style="margin:0;font-size:12px;color:#9ca3af">Expert Doi Trans · Alba Iulia, Micești · inchirieri.vercel.app</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendReservationEmails(data: EmailData) {
  const start = formatDate(data.startDate)
  const end = formatDate(data.endDate)

  const emailPromises = [
    resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `🚗 Rezervare nouă: ${data.carName} — ${data.customerName}`,
      html: adminHtml({ ...data, start, end }),
    }),
  ]

  if (data.customerEmail) {
    emailPromises.push(
      resend.emails.send({
        from: FROM,
        to: data.customerEmail,
        subject: `Rezervare primită — ${data.carName} · Expert Doi Trans`,
        html: customerHtml({ customerName: data.customerName, carName: data.carName, start, end, totalPrice: data.totalPrice }),
      })
    )
  }

  await Promise.allSettled(emailPromises)
}
