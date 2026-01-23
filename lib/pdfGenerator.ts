import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from './utils'

// Simple currency formatter for PDFs (avoids special characters)
const formatPDFCurrency = (amount: number) => {
  return `GHS ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface ProjectData {
  id: string
  title: string
  description: string
  requirements: string
  estimated_cost: number
  final_cost?: number
  estimated_duration?: number
  created_at: string
  status: string
  number_of_people?: number
  needs_documentation?: boolean
  include_hosting?: boolean
}

interface ClientData {
  full_name: string
  email: string
}

interface DeveloperData {
  full_name: string
  email: string
}

interface PaymentData {
  paystack_reference: string
  amount: number
  status: string
  created_at: string
  escrow_date?: string
}

// Company details
const COMPANY = {
  name: 'GridNexus',
  address: 'Accra, Ghana',
  email: 'support@gridnexus.com',
  phone: '+233 XX XXX XXXX',
  website: 'www.gridnexus.com',
}

export function generateInvoice(
  project: ProjectData,
  client: ClientData,
  developer: DeveloperData
) {
  const doc = new jsPDF()
  const invoiceNumber = `INV-${project.id.substring(0, 8).toUpperCase()}`
  const invoiceDate = formatDate(new Date().toISOString())

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 105, 20, { align: 'center' })

  // Company details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(COMPANY.name, 20, 35)
  doc.text(COMPANY.address, 20, 40)
  doc.text(COMPANY.email, 20, 45)
  doc.text(COMPANY.phone, 20, 50)

  // Invoice details
  doc.text(`Invoice #: ${invoiceNumber}`, 140, 35)
  doc.text(`Date: ${invoiceDate}`, 140, 40)
  doc.text(`Status: ${project.status}`, 140, 45)

  // Client details
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', 20, 65)
  doc.setFont('helvetica', 'normal')
  doc.text(client.full_name, 20, 70)
  doc.text(client.email, 20, 75)

  // Developer details
  doc.setFont('helvetica', 'bold')
  doc.text('DEVELOPER:', 140, 65)
  doc.setFont('helvetica', 'normal')
  doc.text(developer.full_name, 140, 70)
  doc.text(developer.email, 140, 75)

  // Project details
  doc.setFont('helvetica', 'bold')
  doc.text('PROJECT DETAILS:', 20, 90)
  doc.setFont('helvetica', 'normal')
  doc.text(`Title: ${project.title}`, 20, 95)
  doc.text(`Duration: ${project.estimated_duration || 'TBD'} days`, 20, 100)

  // Line items table
  const lineItems = []
  const baseCost = project.number_of_people 
    ? 1500 * project.number_of_people 
    : project.final_cost || project.estimated_cost

  lineItems.push(['Base Development Cost', `${project.number_of_people || 1} person(s)`, formatPDFCurrency(baseCost)])

  if (project.needs_documentation && project.number_of_people) {
    lineItems.push(['Documentation Services', `${project.number_of_people} person(s)`, formatPDFCurrency(800 * project.number_of_people)])
  }

  if (project.include_hosting) {
    lineItems.push(['Hosting & Deployment', '1', formatPDFCurrency(350)])
  }

  autoTable(doc, {
    startY: 110,
    head: [['Description', 'Quantity', 'Amount']],
    body: lineItems,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    foot: [[{ content: 'TOTAL', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, formatPDFCurrency(project.final_cost || project.estimated_cost)]],
    footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
  })

  // Terms
  const finalY = (doc as any).lastAutoTable.finalY || 150
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT TERMS:', 20, finalY + 15)
  doc.setFont('helvetica', 'normal')
  doc.text('• Payment is held in escrow until project delivery', 20, finalY + 20)
  doc.text('• Payment released upon client acceptance of deliverables', 20, finalY + 25)
  doc.text('• Escrow provides security for both parties', 20, finalY + 30)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Thank you for your business!', 105, 280, { align: 'center' })
  doc.text(COMPANY.website, 105, 285, { align: 'center' })

  doc.save(`Invoice-${invoiceNumber}.pdf`)
}

export function generateReceipt(
  project: ProjectData,
  client: ClientData,
  developer: DeveloperData,
  payment: PaymentData
) {
  const doc = new jsPDF()
  const receiptNumber = `REC-${payment.paystack_reference.substring(0, 8).toUpperCase()}`
  const receiptDate = formatDate(payment.escrow_date || payment.created_at)

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' })

  // Company details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(COMPANY.name, 20, 35)
  doc.text(COMPANY.address, 20, 40)
  doc.text(COMPANY.email, 20, 45)

  // Receipt details
  doc.text(`Receipt #: ${receiptNumber}`, 140, 35)
  doc.text(`Date: ${receiptDate}`, 140, 40)
  doc.text(`Status: ${payment.status.toUpperCase()}`, 140, 45)

  // Paid by
  doc.setFont('helvetica', 'bold')
  doc.text('PAID BY:', 20, 60)
  doc.setFont('helvetica', 'normal')
  doc.text(client.full_name, 20, 65)
  doc.text(client.email, 20, 70)

  // Payment details box
  doc.setFillColor(243, 244, 246)
  doc.rect(20, 80, 170, 40, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('AMOUNT PAID:', 25, 90)
  doc.setFontSize(24)
  doc.setTextColor(34, 197, 94)
  doc.text(formatPDFCurrency(payment.amount), 25, 105)
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Reference: ${payment.paystack_reference}`, 25, 115)

  // Project details
  doc.setFont('helvetica', 'bold')
  doc.text('PROJECT DETAILS:', 20, 135)
  doc.setFont('helvetica', 'normal')
  doc.text(`Title: ${project.title}`, 20, 140)
  doc.text(`Project ID: ${project.id}`, 20, 145)
  doc.text(`Developer: ${developer.full_name}`, 20, 150)

  // Payment breakdown
  autoTable(doc, {
    startY: 160,
    head: [['Description', 'Amount']],
    body: [
      ['Project Development', formatPDFCurrency(payment.amount)],
      ['Platform Fee', formatPDFCurrency(0)],
    ],
    theme: 'plain',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    foot: [['TOTAL PAID', formatPDFCurrency(payment.amount)]],
    footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
  })

  // Escrow notice
  const finalY = (doc as any).lastAutoTable.finalY || 200
  doc.setFillColor(254, 243, 199)
  doc.rect(20, finalY + 10, 170, 25, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('ESCROW PROTECTION:', 25, finalY + 18)
  doc.setFont('helvetica', 'normal')
  doc.text('Your payment is held securely in escrow. Funds will be released to the developer', 25, finalY + 23)
  doc.text('only after you accept the delivered work. Your payment is protected.', 25, finalY + 28)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('This is a computer-generated receipt and does not require a signature.', 105, 270, { align: 'center' })
  doc.text(COMPANY.website, 105, 275, { align: 'center' })

  doc.save(`Receipt-${receiptNumber}.pdf`)
}

export function generateContract(
  project: ProjectData,
  client: ClientData,
  developer: DeveloperData
) {
  const doc = new jsPDF()
  const contractNumber = `CNT-${project.id.substring(0, 8).toUpperCase()}`
  const contractDate = formatDate(new Date().toISOString())

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('WEB DEVELOPMENT SERVICE CONTRACT', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Contract #: ${contractNumber}`, 105, 30, { align: 'center' })
  doc.text(`Date: ${contractDate}`, 105, 35, { align: 'center' })

  // Parties
  doc.setFont('helvetica', 'bold')
  doc.text('THIS AGREEMENT is made between:', 20, 50)
  
  doc.setFont('helvetica', 'normal')
  doc.text(`CLIENT: ${client.full_name} (${client.email})`, 20, 57)
  doc.text(`DEVELOPER: ${developer.full_name} (${developer.email})`, 20, 62)
  doc.text(`PLATFORM: ${COMPANY.name}`, 20, 67)

  // Project scope
  doc.setFont('helvetica', 'bold')
  doc.text('1. PROJECT SCOPE', 20, 80)
  doc.setFont('helvetica', 'normal')
  const scopeLines = doc.splitTextToSize(`Title: ${project.title}`, 170)
  doc.text(scopeLines, 20, 87)
  
  const descLines = doc.splitTextToSize(`Description: ${project.description}`, 170)
  doc.text(descLines, 20, 94)

  // Payment terms
  doc.setFont('helvetica', 'bold')
  doc.text('2. PAYMENT TERMS', 20, 115)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Project Cost: ${formatPDFCurrency(project.final_cost || project.estimated_cost)}`, 20, 122)
  doc.text(`Estimated Duration: ${project.estimated_duration || 'TBD'} days`, 20, 127)
  doc.text('Payment Structure:', 20, 132)
  doc.text('• Full payment to be made upfront and held in escrow by GridNexus', 25, 137)
  doc.text('• Payment released to developer upon client acceptance of deliverables', 25, 142)
  doc.text('• Platform ensures secure transaction and dispute resolution', 25, 147)

  // Deliverables
  doc.setFont('helvetica', 'bold')
  doc.text('3. DELIVERABLES', 20, 160)
  doc.setFont('helvetica', 'normal')
  doc.text('Developer agrees to deliver:', 20, 167)
  doc.text('• Fully functional website as per specifications', 25, 172)
  doc.text('• Source code and documentation', 25, 177)
  if (project.include_hosting) {
    doc.text('• Hosting and deployment services', 25, 182)
  }
  doc.text('• Post-delivery support as agreed', 25, 187)

  // Add new page for additional terms
  doc.addPage()

  // Client obligations
  doc.setFont('helvetica', 'bold')
  doc.text('4. CLIENT OBLIGATIONS', 20, 20)
  doc.setFont('helvetica', 'normal')
  doc.text('Client agrees to:', 20, 27)
  doc.text('• Provide necessary content, assets, and information promptly', 25, 32)
  doc.text('• Review and provide feedback within reasonable timeframes', 25, 37)
  doc.text('• Make payment as agreed through the platform', 25, 42)
  doc.text('• Accept or request revisions within 7 days of delivery', 25, 47)

  // Developer obligations
  doc.setFont('helvetica', 'bold')
  doc.text('5. DEVELOPER OBLIGATIONS', 20, 60)
  doc.setFont('helvetica', 'normal')
  doc.text('Developer agrees to:', 20, 67)
  doc.text('• Complete work according to specifications and timeline', 25, 72)
  doc.text('• Maintain communication throughout the project', 25, 77)
  doc.text('• Deliver work that is free from defects and errors', 25, 82)
  doc.text('• Provide reasonable revisions as per agreement', 25, 87)

  // Intellectual property
  doc.setFont('helvetica', 'bold')
  doc.text('6. INTELLECTUAL PROPERTY', 20, 100)
  doc.setFont('helvetica', 'normal')
  doc.text('Upon full payment:', 20, 107)
  doc.text('• All intellectual property rights transfer to the client', 25, 112)
  doc.text('• Developer retains right to use project in portfolio', 25, 117)
  doc.text('• Client owns all source code and content', 25, 122)

  // Dispute resolution
  doc.setFont('helvetica', 'bold')
  doc.text('7. DISPUTE RESOLUTION', 20, 135)
  doc.setFont('helvetica', 'normal')
  doc.text('Any disputes will be:', 20, 142)
  doc.text('• First mediated through GridNexus platform', 25, 147)
  doc.text('• Resolved according to platform policies', 25, 152)
  doc.text('• Subject to Ghana law and jurisdiction', 25, 157)

  // Termination
  doc.setFont('helvetica', 'bold')
  doc.text('8. TERMINATION', 20, 170)
  doc.setFont('helvetica', 'normal')
  doc.text('Either party may terminate with written notice if:', 20, 177)
  doc.text('• Other party breaches material terms of agreement', 25, 182)
  doc.text('• Mutual agreement is reached', 25, 187)
  doc.text('• Escrow funds handled according to platform policy', 25, 192)

  // Signatures section
  doc.setFont('helvetica', 'bold')
  doc.text('ACCEPTANCE', 20, 210)
  doc.setFont('helvetica', 'normal')
  doc.text('By proceeding with payment on the GridNexus platform, both parties', 20, 217)
  doc.text('acknowledge and accept the terms of this contract.', 20, 222)

  doc.setFillColor(243, 244, 246)
  doc.rect(20, 230, 80, 20, 'F')
  doc.rect(110, 230, 80, 20, 'F')
  
  doc.setFontSize(9)
  doc.text('CLIENT', 60, 238, { align: 'center' })
  doc.text(client.full_name, 60, 243, { align: 'center' })
  
  doc.text('DEVELOPER', 150, 238, { align: 'center' })
  doc.text(developer.full_name, 150, 243, { align: 'center' })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('This contract is facilitated by GridNexus platform.', 105, 270, { align: 'center' })
  doc.text(`Generated on ${contractDate} | ${COMPANY.website}`, 105, 275, { align: 'center' })

  doc.save(`Contract-${contractNumber}.pdf`)
}

