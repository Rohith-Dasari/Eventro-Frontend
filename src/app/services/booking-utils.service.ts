import { Injectable } from '@angular/core';
import { EnrichedBooking } from '../models/bookings';
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

  generateQRData(booking: EnrichedBooking | null): string {
    if (!booking) return '';
    const show = booking.show_details as any;
    const venue = this.getVenue(show);
    const event = this.getEvent(show);

    const showDate = this.getShowDate(show);
    const showTime = this.getShowTime(show);
    const eventName = event?.name ?? event?.Name ?? 'Event Name Not Available';
    const venueName = venue?.venue_name ?? venue?.Name ?? 'Venue Not Available';

    const qrData = {
      bookingId: booking.booking_id,
      eventId: show?.event_id ?? event?.ID,
      eventName,
      showId: show?.id ?? show?.ID,
      userId: booking.user_id,
      seats: booking.seats,
      numTickets: booking.num_tickets,
      totalAmount: booking.total_booking_price,
      showDate,
      showTime,
      venueId: venue?.venue_id ?? venue?.ID,
      venueName,
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

  async downloadTicketPDF(booking: EnrichedBooking): Promise<void> {
    const doc = new jsPDF();
    
    doc.setFont('times');
    
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text('EVENTRO - EVENT TICKET', 105, 25, { align: 'center' });
    
    doc.setDrawColor(52, 73, 94);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(16);
    doc.setTextColor(52, 73, 94);
    doc.text('Event Details', 20, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const show = booking.show_details as any;
    const venue = this.getVenue(show);
    const event = this.getEvent(show);
    const venueCity = venue?.city ?? venue?.City ?? '';
    const venueState = venue?.state ?? venue?.State ?? '';
    const showDate = this.formatDate(this.getShowDate(show));
    const showTime = this.getShowTime(show) || 'Time TBD';
    const eventName = event?.name ?? event?.Name ?? 'Event Name Not Available';
    const venueName = venue?.venue_name ?? venue?.Name ?? 'Venue Not Available';
    
    let yPos = 65;
    
    doc.text(`Event: ${eventName}`, 20, yPos);
    yPos += 10;
    doc.text(`Venue: ${venueName}`, 20, yPos);
    yPos += 10;
    doc.text(`Address: ${venueCity}${venueState ? ', ' + venueState : ''}`, 20, yPos);
    yPos += 10;
    doc.text(`Date: ${showDate}`, 20, yPos);
    yPos += 10;
    doc.text(`Time: ${showTime}`, 20, yPos);
    
    yPos += 25;
    doc.setFontSize(16);
    doc.setTextColor(52, 73, 94);
    doc.text('Booking Details', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
  
    yPos += 10;
    doc.text(`Number of Tickets: ${booking.num_tickets}`, 20, yPos);
    yPos += 10;
    doc.text(`Seat Numbers: ${booking.seats.join(', ')}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Amount: ₹${booking.total_booking_price}`, 20, yPos);
    yPos += 10;
    doc.text(`Booking Date: ${this.formatDate(booking.time_booked)}`, 20, yPos);
    
    yPos += 25;
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Scan QR Code at Venue:', 20, yPos);
    
    const qrData = this.generateQRData(booking);
    await this.addQRCodeToPDF(doc, qrData, 20, yPos + 5);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Contains booking verification data', 20, yPos + 50);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing EVENTRO!', 105, 280, { align: 'center' });
    doc.text('Please arrive 30 minutes before the show time.', 105, 290, { align: 'center' });
    
    const safeEventName = eventName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `EVENTRO_Ticket_${booking.booking_id}_${safeEventName}.pdf`;
    doc.save(fileName);
  }

  private getVenue(show: any): any {
    return show?.venue ?? show?.Venue ?? {};
  }

  private getEvent(show: any): any {
    return show?.event ?? show?.Event ?? {};
  }

  private getShowDate(show: any): string | Date | undefined {
    return show?.show_date ?? show?.ShowDate;
  }

  private getShowTime(show: any): string | undefined {
    return show?.show_time ?? show?.ShowTime;
  }
}
