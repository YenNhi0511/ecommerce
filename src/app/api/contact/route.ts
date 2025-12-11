import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, phone } = body;
    if (!name || !email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await dbConnect();
    const doc = await ContactMessage.create({ name, email, subject, message, phone });

    // send email notification using Gmail SMTP (App Password)
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS;
    const to = process.env.CONTACT_RECEIVER || user;

    if (user && pass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });

      const mailOptions = {
        from: user,
        to,
        subject: `[Liên hệ] ${subject || 'Thông báo liên hệ mới'}`,
        text: `Bạn có một tin nhắn mới từ ${name} <${email}>\n\nSố điện thoại: ${phone || 'không có'}\n\nNội dung:\n${message}`
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (e) {
        console.error('Failed to send contact email', e);
      }
    } else {
      console.warn('GMAIL_USER or GMAIL_PASS not set; skipping email send');
    }

    return NextResponse.json({ message: 'Received', contact: doc }, { status: 201 });
  } catch (err: any) {
    console.error('Contact POST error', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
