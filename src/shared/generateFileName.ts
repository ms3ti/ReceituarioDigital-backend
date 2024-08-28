export const generateFileName = (
  prescriptionId: string,
  doctorName: string,
  patientName: string,
): string => {
  const filename = `${doctorName.split(' ').join('')}-${patientName
    .split(' ')
    .join('')}${prescriptionId.length ? `-${prescriptionId}` : ''}`;
  return filename;
};
