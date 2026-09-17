export const createInitialOrganisation = () => ({
  name: '', pan: '', address: '', urn: '', urnDate: '',
  email: '', phone: '', signatory: '', designation: '',
})

const localDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const createInitialReceipt = () => ({
  donorName: '', donorIdType: 'PAN', donorId: '', donorAddress: '',
  donorEmail: '', amount: '', date: localDate(),
  mode: 'UPI', reference: '', type: 'Others', purpose: '', receiptNo: '',
})
