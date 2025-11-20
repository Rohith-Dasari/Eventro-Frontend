import { Injectable } from '@angular/core';
import { Booking } from '../models/bookings';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class BookingUtilsService {

  formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return 'Date TBD';
    try {
      const date =
        dateInput instanceof Date ? dateInput : new Date(dateInput);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  }

  generateQRData(booking: Booking | null): string {
    if (!booking) return '';
    const qrData = {
      bookingId: booking.booking_id,
      eventId: booking.event_id,
      eventName: booking.event_name,
      showId: booking.show_id,
      userEmail: booking.user_email,
      seats: booking.seats,
      numTickets: booking.num_tickets_booked,
      totalAmount: booking.total_price,
      showDate: booking.booking_date,
      showTime: this.formatTime(booking.booking_date),
      venueName: booking.venue_name,
      venueCity: booking.venue_city,
      venueState: booking.venue_state,
      timeBooked: booking.time_booked,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  }

  async addQRCodeToPDF(doc: jsPDF, qrData: string, x: number, y: number): Promise<void> {
    try {
      console.log('QR Code Data:', qrData);
      
      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      doc.addImage(qrDataURL, 'PNG', x, y, 40, 40);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 245, 245);
      doc.rect(x, y, 40, 40, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('QR ERROR', x + 20, y + 22, { align: 'center' });
    }
  }

  async downloadTicketPDF(booking: Booking): Promise<void> {
    const doc = new jsPDF();
    const marginX = 20;
    const usableWidth = 170;
    
    doc.setFont('times');
    
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('EVENTRO - EVENT TICKET', 105, 25, { align: 'center' });
    
    doc.setDrawColor(52, 73, 94);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    const qrData = this.generateQRData(booking);
    await this.addQRCodeToPDF(doc, qrData, 150, 50);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Show this QR at entry', 170, 95, { align: 'center' });

    const venueCity = booking.venue_city ?? '';
    const venueState = booking.venue_state ?? '';
    const showDate = this.formatDate(booking.booking_date);
    const showTime = this.formatTime(booking.booking_date) || 'Time TBD';
    const eventName = booking.event_name ?? 'Event Name Not Available';
    const venueName = booking.venue_name ?? 'Venue Not Available';

    let yPos = 55;

    yPos = this.addSection(doc, 'Event Details', [
      { label: 'Event', value: eventName },
      { label: 'Venue', value: venueName },
      { label: 'Address', value: `${venueCity}${venueState ? ', ' + venueState : ''}` || 'Address not available' },
      { label: 'Date', value: showDate },
      { label: 'Time', value: showTime }
    ], marginX, yPos, usableWidth - 60);

    yPos += 12;

    yPos = this.addSection(doc, 'Booking Details', [
      { label: 'Booking ID', value: booking.booking_id },
      { label: 'Seats', value: booking.seats.join(', ') || 'N/A' },
      { label: 'Number of Tickets', value: `${booking.num_tickets_booked}` },
      { label: 'Total Amount', value: `Rs. ${booking.total_price}` },
      { label: 'Booked On', value: this.formatDate(booking.time_booked) }
    ], marginX, yPos, usableWidth - 20);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(52, 73, 94);
    doc.text('Contains booking verification data. Arrive 30 mins early.', marginX, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing EVENTRO!', 105, 280, { align: 'center' });
    doc.text('Please arrive 30 minutes before the show time.', 105, 290, { align: 'center' });
    
    const safeEventName = eventName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `EVENTRO_Ticket_${booking.booking_id}_${safeEventName}.pdf`;
    doc.save(fileName);
  }

  formatTime(dateInput: string | Date | undefined): string {
    if (!dateInput) return 'Time TBD';
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return 'Time TBD';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private addSection(
    doc: jsPDF,
    title: string,
    entries: Array<{ label: string; value: string }>,
    startX: number,
    startY: number,
    width: number
  ): number {
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text(title, startX, startY);
    let yPos = startY + 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    entries.forEach(entry => {
      yPos = this.addKeyValueLine(doc, entry.label, entry.value, startX, yPos, width);
      yPos += 4;
    });

    return yPos;
  }

  private addKeyValueLine(
    doc: jsPDF,
    label: string,
    value: string,
    startX: number,
    startY: number,
    width: number
  ): number {
    const labelWidth = 32;
    doc.setFont('times', 'bold');
    doc.text(`${label}:`, startX, startY);
    doc.setFont('times', 'normal');
    const textLines = doc.splitTextToSize(value || '-', width - labelWidth);
    doc.text(textLines, startX + labelWidth, startY);
    const lineHeight = 5.5;
    const consumedHeight = lineHeight * (textLines.length || 1);
    return startY + consumedHeight;
  }
}
