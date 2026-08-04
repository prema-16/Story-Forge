import { logger } from '../config/logger';

export interface TaxCalculationResult {
  subtotal: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
  sacCode: string;
  isInterstate: boolean;
}

export class GSTInvoiceService {
  private readonly sellerStateCode = '27'; // Maharashtra State Code (Standard Company HQ)
  private readonly defaultSacCode = '998314'; // IT & AI Cloud Software SAC Code

  calculateTax(subtotalAmount: number, customerStateCode = '27'): TaxCalculationResult {
    const isInterstate = customerStateCode !== this.sellerStateCode;

    if (isInterstate) {
      const igstAmount = Math.round(subtotalAmount * 0.18);
      return {
        subtotal: subtotalAmount,
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 18,
        igstAmount,
        totalAmount: subtotalAmount + igstAmount,
        sacCode: this.defaultSacCode,
        isInterstate: true,
      };
    } else {
      const cgstAmount = Math.round(subtotalAmount * 0.09);
      const sgstAmount = Math.round(subtotalAmount * 0.09);
      return {
        subtotal: subtotalAmount,
        cgstRate: 9,
        cgstAmount,
        sgstRate: 9,
        sgstAmount,
        igstRate: 0,
        igstAmount: 0,
        totalAmount: subtotalAmount + cgstAmount + sgstAmount,
        sacCode: this.defaultSacCode,
        isInterstate: false,
      };
    }
  }

  generateInvoiceHTML(invoiceData: {
    invoiceNumber: string;
    customerName: string;
    customerGstin?: string;
    date: string;
    planName: string;
    taxResult: TaxCalculationResult;
  }): string {
    const { invoiceNumber, customerName, customerGstin, date, planName, taxResult } = invoiceData;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>GST Tax Invoice — ${invoiceNumber}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #7c3aed; }
        .section { margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 13px; }
        th { background: #f8f7ff; color: #555; }
        .total-row { font-weight: bold; background: #f1eeff; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="title">STORYFORGE AI</div>
            <p>StoryForge AI Media Technologies Pvt Ltd</p>
            <p>GSTIN: 27AAAAA0000A1Z5 · SAC: ${taxResult.sacCode}</p>
          </div>
          <div style="text-align: right;">
            <h2>TAX INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${date}</p>
          </div>
        </div>

        <div class="section">
          <h3>Billed To:</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          ${customerGstin ? `<p><strong>GSTIN:</strong> ${customerGstin}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>SAC Code</th>
              <th>Subtotal (₹)</th>
              <th>CGST (9%)</th>
              <th>SGST (9%)</th>
              <th>IGST (18%)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${planName} Subscription</td>
              <td>${taxResult.sacCode}</td>
              <td>₹${(taxResult.subtotal / 100).toFixed(2)}</td>
              <td>₹${(taxResult.cgstAmount / 100).toFixed(2)}</td>
              <td>₹${(taxResult.sgstAmount / 100).toFixed(2)}</td>
              <td>₹${(taxResult.igstAmount / 100).toFixed(2)}</td>
              <td>₹${(taxResult.totalAmount / 100).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="6" style="text-align: right;">Total Amount Payable:</td>
              <td>₹${(taxResult.totalAmount / 100).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 40px; font-size: 11px; color: #777; text-align: center;">
          This is a computer-generated GST Tax Invoice and does not require a physical signature.
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

export const gstInvoiceService = new GSTInvoiceService();
