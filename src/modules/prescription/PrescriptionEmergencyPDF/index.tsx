import ReactPDF, {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { formatToCEP, formatToPhone } from 'brazilian-values';
import { readFile, rm } from 'fs/promises';
import { resolve } from 'path';
import { capitalizeFirstLetter } from '../../../shared/capilatilize';
import { RegionalCouncilIdToName } from '../../../shared/enum/councilType';
import { DocumentTypeEnum } from '../../../shared/enum/document.type.enum';
import { PrescriptionTypeEnum } from '../../../shared/enum/prescription.type.enum';
import { RegionalCouncilEnum } from '../../../shared/enum/regional.council.enum';
import { formatExtendedDate } from '../../../shared/formatExtendedDate';
import { generateFileName } from '../../../shared/generateFileName';
import { IPrescriptionCompositionDto } from '../contracts/dtos/prescription.composition.dto';
import { IPrescriptionEmergencyForPrint } from '../contracts/dtos/prescription.emergency.dto';

const styles = StyleSheet.create({
  document: {
    lineHeight: '1.5px',
    marginBottom: '70px',
    paddingBottom: '70px',
  },
  img: {
    width: 40,
    height: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '15px',
    paddingLeft: '80px',
    paddingRight: '80px',
    backgroundColor: '#F7F8FA',
    marginBottom: '15px',
    borderBottom: '1px solid #EDEDF3',
    alignContent: 'center',
    alignItems: 'center',
    paddingTop: '10px',
  },
  patientTitle: {
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '9px',
    lineHeight: '120%',
    color: '#94A0B4',
    textAlign: 'center',
    marginTop: '28px',
  },
  patientName: {
    fontWeight: 900,
    fontSize: '12px',
    textAlign: 'center',
    color: '#202D46',
    paddingBottom: '3px',
  },
  cpf: {
    fontWeight: 400,
    fontSize: '9px',
    lineHeight: '130%',
    textAlign: 'center',
    color: '#202D46',
  },
  address: {
    fontWeight: 400,
    fontSize: '9px',
    lineHeight: '130%',
    textAlign: 'center',
    color: '#202D46',
  },
  medicine: {
    color: '#202D46',
    fontWeight: 400,
    fontSize: '11px',
    marginBottom: '20px',
    textOverflow: 'ellipsis',
  },
  date: {
    fontWeight: 400,
    fontSize: '10px',
    textAlign: 'center',
    color: '#202D46',
  },
  companyName: {
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: '12px',
    color: '#202D46',
  },
  footerInfo: {
    fontWeight: 400,
    color: '#202D46',
    fontSize: '10px',
  },
  footerAlert: {
    bottom: '20px',
    fontWeight: 400,
    color: '#202D46',
    fontSize: '8px',
    textAlign: 'justify',
  },
  registerTitle: {
    fontWeight: 900,
    fontSize: '15px',
    color: '#202D46',
    textAlign: 'center',
  },
  codePlataform: {
    border: '1px solid #7D899D',
    width: '500px',
    height: '50px',
  },
  boxTitle: {
    fontSize: '10px',
    marginLeft: '12px',
    marginTop: '12px',
  },
  center: {
    height: '80%',
    paddingTop: '10px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  note: {
    marginTop: '20px',
    border: '1px solid #7D899D',
    width: '500px',
    height: '100px',
  },
  text: {
    color: '#202D46',
  },
  buyIdentification: {
    marginTop: '20px',
    width: '500px',
    fontSize: '13px',
    border: '1px solid #7D899D',
    backgroundColor: '#EDEDF3',
    height: '30px',
    textAlign: 'left',
    justifyContent: 'center',
    paddingLeft: '10px',
  },
  completeLine: {
    border: '1px solid #7D899D',
    backgroundColor: '#FFFFFF',
    height: '30px',
    justifyContent: 'center',
    width: '500px',
  },
  label: {
    color: '#202D46',
    textAlign: 'left',
    paddingLeft: '10px',
    fontSize: '13px',
  },
  doubleInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '500px',
  },
  halfLine: {
    border: '1px solid #7D899D',
    backgroundColor: '#FFFFFF',
    height: '30px',
    justifyContent: 'center',
    width: '50%',
  },
  prescriptionCode: {
    color: '#94A0B4',
    textAlign: 'center',
    fontSize: '9px',
    marginTop: '22px',
    width: '500px',
    height: '20px',
    marginBottom: 0,
    paddingBottom: 0,
  },
  certificateTitle: {
    fontWeight: 900,
    textAlign: 'center',
    fontSize: '12px',
    marginTop: '16px',
  },
  doctorInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginRight: '0px',
    paddingRight: '0px',
    textAlign: 'right',
  },
  content: {
    paddingLeft: '100px',
    paddingRight: '100px',
    marginTop: '65px',
    color: '#202D46',
    paddingBottom: '70px',
    marginBottom: '70px',
  },
  doctorSignature: {
    alignItems: 'center',
    ustifyContent: 'center',
    fontWeight: 900,
    textAlign: 'center',
    color: '#202D46',
    fontSize: '12px',
  },
  row: {
    height: '1px',
    backgroundColor: '#202D46',
    width: '300px',
    textAlign: 'center',
    margin: 'auto',
    marginBottom: '8px',
  },
  manualSignature: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: '70px',
    marginBottom: '0px',
    paddingBottom: '0px',
  },
  doctorSpeciality: {
    fontWeight: 500,
    color: '#202D46',
    fontSize: '10px',
  },
});
interface Props {
  prescription: IPrescriptionEmergencyForPrint;
}

const PrescriptionPDF = ({ prescription }: Props) => {
  const prescriptionTypeTitle: { [x: number]: string } = {
    1: 'Receita digital',
    2: 'Receita digital Controlada',
    3: 'Receita digital Antimicrobianos',
  };

  const registerMedicine = [
    PrescriptionTypeEnum.ANTIMICROBIAL_PRESCRIPTION,
    PrescriptionTypeEnum.CONTROLLED_RECIPE,
  ];
  const isFreeText = (prescriptionComposition: IPrescriptionCompositionDto) =>
    (prescriptionComposition.medicine === null ||
      prescriptionComposition.medicine === '') &&
    (prescriptionComposition.activePrinciple === null ||
      prescriptionComposition.activePrinciple === '') &&
    (prescriptionComposition.dosage === null ||
      prescriptionComposition.dosage === '') &&
    (prescriptionComposition.packing === null ||
      prescriptionComposition.packing === '');

  const address = `${prescription.doctor.address.street}, ${
    prescription.doctor.address.number
  } ${formatToCEP(prescription.doctor.address.cep)}, ${
    prescription.doctor.address.city
  } - ${prescription.doctor.address.state}, ${
    prescription.doctor.address.complement
  }`;

  return (
    <Document>
      <Page
        size="A4"
        style={{
          marginBottom: '70px',
          paddingBottom: '70px',
        }}
      >
        <View fixed style={styles.header}>
          <View
            style={{
              marginRight: '27px',
            }}
          >
            <Image
              src={
                prescription.doctor.imageUrl
                  ? prescription.doctor.imageUrl
                  : resolve(
                      __dirname,
                      '..',
                      '..',
                      '..',
                      'assets',
                      'logo-mrd-mini.png',
                    )
              }
              style={styles.img}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              textAlign: 'left',
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#202D46',
              }}
              color="#202D46"
            >
              {prescription.doctor.name}
            </Text>
            <Text
              color="#202D46"
              style={{
                fontSize: '10px',
                fontWeight: 400,
                color: '#202D46',
              }}
            >
              {`${RegionalCouncilIdToName[prescription.doctor.councilType]} ${
                prescription.doctor.crm
              }`}
            </Text>
            <Text>
              {prescription.doctor.doctorSpecialty.map((speciality, index) => {
                if (index === 0) {
                  return (
                    <Text
                      key={speciality.id}
                      style={{
                        fontSize: '9px',
                        fontWeight: 400,
                        color: '#7D899D',
                      }}
                    >{`${speciality.specialty} ${
                      [
                        RegionalCouncilEnum.CMRV,
                        RegionalCouncilEnum.CRM,
                      ].includes(prescription.doctor.councilType)
                        ? `${
                            Boolean(speciality.registrationNumber.length)
                              ? `${
                                  prescription.doctor.councilType ===
                                  RegionalCouncilEnum.CMRV
                                    ? '- MAPA'
                                    : '- RQE'
                                } ${speciality?.registrationNumber}`
                              : ''
                          }`
                        : ''
                    }`}</Text>
                  );
                }
              })}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <Text
              style={{
                fontWeight: 800,
                fontSize: '12px',
                color: '#202D46',
                marginBottom: 0,
                paddingBottom: 0,
              }}
            >
              {
                prescriptionTypeTitle[
                  prescription.prescription.idPrescriptionType
                ]
              }
            </Text>
            <br />
            <Text
              style={{
                color: '#94A0B4',
                textAlign: 'right',
                fontSize: '9px',
                marginTop: '5px',
                width: '500px',
                marginBottom: 0,
                paddingBottom: 0,
              }}
            ></Text>
          </View>
        </View>
        <View>
          <Text style={styles.patientTitle}>
            {prescription.doctor.councilType === 2
              ? 'Proprietário'
              : 'Paciente'}
          </Text>
          <Text style={styles.patientName}>
            {prescription.prescription.person.name}
          </Text>
        </View>

        <View
          style={{
            paddingLeft: '70px',
            paddingRight: '70px',
            marginTop: '35px',
            paddingBottom: '70px',
            marginBottom: '70px',
          }}
        >
          {prescription.prescription.prescriptionCompositons.map(
            (
              prescriptionCompostion: IPrescriptionCompositionDto,
              index: number,
            ) => {
              if (isFreeText(prescriptionCompostion)) {
                return (
                  <Text
                    key={index}
                    style={{
                      color: '#202D46',
                      fontWeight: 400,
                      fontSize: '11px',
                      marginBottom: '20px',
                      marginTop: '20px',
                      maxWidth: '370px',
                    }}
                    wrap
                  >
                    {`${index + 1}. ${prescriptionCompostion.description}`}
                  </Text>
                );
              } else if (prescriptionCompostion.medicineId > 0) {
                return (
                  <View
                    key={index}
                    style={{
                      marginBottom: '20px',
                      marginTop: '20px',
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        alignContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#202D46',
                          fontWeight: 900,
                          fontSize: '11px',
                          marginBottom: '5px',
                          maxWidth: '370px',
                        }}
                      >
                        {`${
                          index + 1
                        }. ${prescriptionCompostion.medicineDto.product.toUpperCase()} `}
                      </Text>

                      <Text
                        style={{
                          color: '#3E4C62',
                          fontWeight: 700,
                          fontSize: '10px',
                          textOverflow: 'ellipsis',
                        }}
                      >{`${prescriptionCompostion.quantity} ${
                        prescriptionCompostion.quantity > 1
                          ? 'embalagens'
                          : 'embalagem'
                      }`}</Text>
                    </View>
                    <Text
                      style={{
                        color: '#3E4C62',
                        fontWeight: 400,
                        fontSize: '10px',
                        maxWidth: '370px',
                      }}
                    >
                      {capitalizeFirstLetter(
                        `${prescriptionCompostion.medicineDto.substance}, ${prescriptionCompostion.medicineDto.presentation} \n ${prescriptionCompostion?.dosage} `,
                      )}
                    </Text>
                  </View>
                );
              } else {
                return (
                  <Text
                    key={index}
                    style={{
                      color: '#3E4C62',
                      fontWeight: 400,
                      fontSize: '10px',
                      marginBottom: '20px',
                      marginTop: '20px',
                      maxWidth: '370px',
                    }}
                    wrap
                  >
                    {`${index + 1}. ${prescriptionCompostion.medicine}, ${
                      prescriptionCompostion.activePrinciple
                    } \n ${prescriptionCompostion.description}, ${
                      prescriptionCompostion.packing
                    } \n ${prescriptionCompostion.dosage}`}
                  </Text>
                );
              }
            },
          )}
        </View>

        <View style={styles.manualSignature}>
          {!prescription.prescription.assigned ? (
            <View style={styles.row}></View>
          ) : (
            ''
          )}
          <Text style={styles.doctorSignature}>
            {`${prescription.doctor.name}`}
          </Text>
          <Text style={styles.doctorSignature}>
            {`${RegionalCouncilIdToName[prescription.doctor.councilType]} ${
              prescription.doctor.crm
            } ${prescription.doctor.councilUf}`}
          </Text>
          {prescription.doctor.doctorSpecialty.map((speciality, index) => {
            if (index <= 1) {
              return (
                <Text key={speciality.id} style={styles.doctorSpeciality}>{`${
                  speciality.specialty
                } ${
                  [RegionalCouncilEnum.CMRV, RegionalCouncilEnum.CRM].includes(
                    prescription.doctor.councilType,
                  )
                    ? `${
                        speciality.registrationNumber.length
                          ? `${
                              prescription.doctor.councilType ===
                              RegionalCouncilEnum.CMRV
                                ? '- MAPA'
                                : '- RQE'
                            } ${speciality?.registrationNumber}`
                          : ''
                      }`
                    : ''
                }`}</Text>
              );
            }
          })}
          <Text style={styles.date}>
            {`${formatExtendedDate(new Date())}, ${
              prescription.doctor.address.city
            } - ${prescription.doctor.address.state}`}
          </Text>
          <View
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Text style={styles.prescriptionCode}>
              {prescription.prescription.assigned
                ? 'Documento assinado digitalmente, acesse assinaturadigital.iti.gov.br para validar a assinatura'
                : ''}
            </Text>
          </View>
        </View>
        <View
          fixed
          style={{
            bottom: '0px',
            width: '100%',
            height: '85px',
            backgroundColor: '#F7F8FA',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingLeft: '80px',
            paddingRight: '80px',
            paddingTop: '10px',
            borderTop: '1px solid #EDEDF3',
            position: 'absolute',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                padding: '0px',
                margin: '0px',
                width: '70%',
              }}
            >
              <Text style={styles.companyName}>
                {prescription.doctor.address.ownerName}
              </Text>
              <Text style={styles.footerInfo}>
                {prescription.doctor.address.cnpj
                  ? `CNPJ: ${prescription.doctor.address.cnpj}`
                  : ''}
              </Text>
              <Text style={[styles.footerInfo, { marginBottom: '10px' }]}>
                {address}
              </Text>
            </View>
            <View style={{ padding: '0px', margin: '0px' }}>
              <Text style={styles.footerInfo}>
                {formatToPhone(String(prescription.doctor.address.ownerPhone))}
              </Text>
              <Text style={styles.footerInfo}>
                {prescription.doctor.address.ownerEmail}
              </Text>
              <Text
                style={styles.footerInfo}
                render={({ pageNumber, totalPages }) =>
                  `Página: ${pageNumber}/${totalPages}`
                }
              ></Text>
            </View>
          </View>

          <View>
            <Text style={styles.footerAlert}>
              Alertamos que no caso da farmácia não aceitar a prescrição por
              falta de dados do paciente, a responsabilidade dessa emissão é
              inteiramente do prescritor.
            </Text>
          </View>
        </View>
      </Page>
      {registerMedicine.includes(
        prescription.prescription.idPrescriptionType,
      ) ? (
        <Page size="A4">
          <View
            fixed
            style={{
              ...styles.header,
            }}
          >
            <View
              style={{
                marginRight: '27px',
              }}
            >
              <Image
                src={
                  prescription.doctor.imageUrl
                    ? prescription.doctor.imageUrl
                    : resolve(
                        __dirname,
                        '..',
                        '..',
                        '..',
                        'assets',
                        'logo-mrd-mini.png',
                      )
                }
                style={styles.img}
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'wrap',
                textAlign: 'left',
              }}
            >
              <Text
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#202D46',
                }}
                color="#202D46"
              >
                {prescription.doctor.name}
              </Text>
              <Text
                color="#202D46"
                style={{
                  fontSize: '10px',
                  fontWeight: 400,
                  color: '#202D46',
                }}
              >
                {`${RegionalCouncilIdToName[prescription.doctor.councilType]} ${
                  prescription.doctor.crm
                }`}
              </Text>
              <Text>
                {prescription.doctor.doctorSpecialty.map(
                  (speciality, index) => {
                    if (index === 0) {
                      return (
                        <Text
                          key={speciality.id}
                          style={{
                            fontSize: '9px',
                            fontWeight: 400,
                            color: '#7D899D',
                          }}
                        >{`${speciality.specialty} ${
                          [
                            RegionalCouncilEnum.CMRV,
                            RegionalCouncilEnum.CRM,
                          ].includes(prescription.doctor.councilType)
                            ? `${
                                speciality.registrationNumber.length
                                  ? `${
                                      prescription.doctor.councilType ===
                                      RegionalCouncilEnum.CMRV
                                        ? '- MAPA'
                                        : '- RQE'
                                    } ${speciality?.registrationNumber}`
                                  : ''
                              }`
                            : ''
                        }`}</Text>
                      );
                    }
                  },
                )}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                alignContent: 'flex-end',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                style={{
                  fontWeight: 800,
                  fontSize: '12px',
                  color: '#202D46',
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                {
                  prescriptionTypeTitle[
                    prescription.prescription.idPrescriptionType
                  ]
                }
              </Text>
              <br />
              <Text
                style={{
                  color: '#94A0B4',
                  textAlign: 'right',
                  fontSize: '9px',
                  marginTop: '5px',
                  width: '500px',
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              ></Text>
            </View>
          </View>

          <Text style={styles.registerTitle}>
            Registro de dispensação de medicamentos
          </Text>
          <View style={styles.center}>
            <View style={styles.codePlataform}>
              <Text style={styles.boxTitle}>
                Código de dispensação gerado na plataforma:
              </Text>
            </View>
            <View style={styles.note}>
              <Text style={styles.boxTitle}>Anotações da dispensação</Text>
            </View>
            <View>
              <View style={styles.buyIdentification}>
                <Text style={styles.text}>Identiicação do Comprador</Text>
              </View>
              <View style={styles.completeLine}>
                <Text style={styles.label}>Nome:</Text>
              </View>
              <View style={styles.completeLine}>
                <Text style={styles.label}>Endereço completo:</Text>
              </View>
              <View style={styles.doubleInfo}>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>RG:</Text>
                </View>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>Emissor:</Text>
                </View>
              </View>
              <View style={styles.doubleInfo}>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>CPF:</Text>
                </View>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>Telefone:</Text>
                </View>
              </View>
            </View>

            <View>
              <View style={styles.buyIdentification}>
                <Text style={styles.text}>Identiicação do Fornecedor</Text>
              </View>
              <View style={styles.completeLine}>
                <Text style={styles.label}>Nome: farmacêutico(a):</Text>
              </View>

              <View style={styles.doubleInfo}>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>CRF:</Text>
                </View>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>UF:</Text>
                </View>
              </View>
              <View style={styles.completeLine}>
                <Text style={styles.label}>Nome a Farmácia:</Text>
              </View>
              <View style={styles.completeLine}>
                <Text style={styles.label}>Endereço completo:</Text>
              </View>
              <View style={styles.doubleInfo}>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>CNPJ:</Text>
                </View>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>Telefone:</Text>
                </View>
              </View>
              <View style={styles.doubleInfo}>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>Data da dispensação:</Text>
                </View>
                <View style={styles.halfLine}>
                  <Text style={styles.label}>Assinatura:</Text>
                </View>
              </View>
            </View>
          </View>
          <View
            fixed
            style={{
              bottom: '0px',
              width: '100%',
              height: '65px',
              backgroundColor: '#F7F8FA',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingLeft: '80px',
              paddingRight: '80px',
              paddingTop: '10px',
              borderTop: '1px solid #EDEDF3',
              position: 'absolute',
            }}
          >
            <View
              style={{
                padding: '0px',
                margin: '0px',
                width: '70%',
              }}
            >
              <Text style={styles.companyName}>
                {prescription.doctor.address.ownerName}
              </Text>
              <Text style={styles.footerInfo}>
                {prescription.doctor.address.cnpj
                  ? `CNPJ: ${prescription.doctor.address.cnpj}`
                  : ''}
              </Text>
              <Text style={[styles.footerInfo, { marginBottom: '10px' }]}>
                {address}
              </Text>
            </View>
            <View style={{ padding: '0px', margin: '0px' }}>
              <Text style={styles.footerInfo}>
                {formatToPhone(String(prescription.doctor.address.ownerPhone))}
              </Text>
              <Text style={styles.footerInfo}>
                {prescription.doctor.address.ownerEmail}
              </Text>
              <Text
                style={styles.footerInfo}
                render={({ pageNumber, totalPages }) =>
                  `Página: ${pageNumber}/${totalPages}`
                }
              ></Text>
            </View>
          </View>
        </Page>
      ) : (
        ''
      )}
    </Document>
  );
};

const CertificatePDF = ({ prescription }: Props) => {
  const titleField = prescription.prescription.prescriptionCompositons.find(
    (pc) => pc.isTitle,
  );
  const contentField = prescription.prescription.prescriptionCompositons.find(
    (pc) => pc.isContent,
  );
  const orientationField =
    prescription.prescription.prescriptionCompositons.find(
      (pc) => pc.isOrientation,
    );

  const justificationField =
    prescription.prescription.prescriptionCompositons.find(
      (pc) => pc.isJustification,
    );

  const isCertified =
    prescription.prescription.documentTypeId === DocumentTypeEnum.Atestado;

  const isExamRequest =
    prescription.prescription.documentTypeId ===
    DocumentTypeEnum['Pedido de exame'];

  function titleGenerate() {
    if (isCertified) {
      return 'Atestado Médico';
    }

    if (titleField?.description.length) {
      return titleField.description;
    }

    if (isExamRequest) {
      return 'Pedido de Exame';
    }

    return '';
  }

  const address = `${prescription.doctor.address.street}, ${
    prescription.doctor.address.number
  } ${formatToCEP(prescription.doctor.address.cep)}, ${
    prescription.doctor.address.city
  } - ${prescription.doctor.address.state}, ${
    prescription.doctor.address.complement
  }`;

  return (
    <Document>
      <Page
        size="A4"
        style={{
          marginBottom: '70px',
          paddingBottom: '70px',
        }}
      >
        <View fixed style={styles.header}>
          <View
            style={{
              marginRight: '27px',
            }}
          >
            <Image
              src={
                prescription.doctor.imageUrl
                  ? prescription.doctor.imageUrl
                  : resolve(
                      __dirname,
                      '..',
                      '..',
                      '..',
                      'assets',
                      'logo-mrd-mini.png',
                    )
              }
              style={styles.img}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              textAlign: 'left',
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#202D46',
              }}
              color="#202D46"
            >
              {prescription.doctor.name}
            </Text>
            <Text
              color="#202D46"
              style={{
                fontSize: '10px',
                fontWeight: 400,
                color: '#202D46',
              }}
            >
              {`${RegionalCouncilIdToName[prescription.doctor.councilType]} ${
                prescription.doctor.crm
              }`}
            </Text>
            <Text>
              {prescription.doctor.doctorSpecialty.map((speciality, index) => {
                if (index === 0) {
                  return (
                    <Text
                      key={speciality.id}
                      style={{
                        fontSize: '9px',
                        fontWeight: 400,
                        color: '#7D899D',
                      }}
                    >{`${speciality.specialty} ${
                      [
                        RegionalCouncilEnum.CMRV,
                        RegionalCouncilEnum.CRM,
                      ].includes(prescription.doctor.councilType)
                        ? `${
                            speciality.registrationNumber.length
                              ? `${
                                  prescription.doctor.councilType ===
                                  RegionalCouncilEnum.CMRV
                                    ? '- MAPA'
                                    : '- RQE'
                                } ${speciality?.registrationNumber}`
                              : ''
                          }`
                        : ''
                    }`}</Text>
                  );
                }
              })}
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <Text
              style={{
                fontWeight: 800,
                fontSize: '12px',
                color: '#202D46',
                marginBottom: 0,
                paddingBottom: 0,
              }}
            >
              {titleGenerate()}
            </Text>
            <br />
            <Text
              style={{
                color: '#94A0B4',
                textAlign: 'right',
                fontSize: '9px',
                marginTop: '5px',
                width: '500px',
                marginBottom: 0,
                paddingBottom: 0,
              }}
            ></Text>
          </View>
        </View>

        <View>
          <Text style={styles.patientTitle}>
            {prescription.doctor.councilType === 2
              ? 'Proprietário'
              : 'Paciente'}
          </Text>
          <Text style={styles.patientName}>
            {prescription.prescription.person.name}
          </Text>
        </View>
        <View
          style={{
            paddingLeft: '100px',
            paddingRight: '100px',
            marginTop: '35px',
            paddingBottom: '70px',
            marginBottom: '70px',
          }}
        >
          {prescription.prescription.prescriptionCompositons.map(
            (
              prescriptionCompostion: IPrescriptionCompositionDto,
              index: number,
            ) => {
              if (
                !prescriptionCompostion.isContent &&
                !prescriptionCompostion.isTitle &&
                !prescriptionCompostion.isOrientation &&
                !prescriptionCompostion.isJustification &&
                prescriptionCompostion.examId
              ) {
                return (
                  <Text key={index} style={styles.medicine}>
                    {`${prescriptionCompostion.exam.name}`}
                  </Text>
                );
              }
              return '';
            },
          )}

          {contentField ? (
            <Text style={styles.medicine} wrap>
              {`${String(contentField?.description)}`}
            </Text>
          ) : (
            ''
          )}
          {orientationField?.description?.length ? (
            <Text style={styles.medicine} wrap>
              {orientationField.description}
            </Text>
          ) : (
            ''
          )}
          {prescription.prescription.prescriptionCompositons.map(
            (
              prescriptionCompostion: IPrescriptionCompositionDto,
              index: number,
            ) => {
              if (
                !prescriptionCompostion.isContent &&
                !prescriptionCompostion.isTitle &&
                !prescriptionCompostion.isOrientation &&
                !prescriptionCompostion.isJustification &&
                !prescriptionCompostion.examId
              ) {
                return (
                  <Text key={index} style={styles.medicine} wrap>
                    {`${prescriptionCompostion.description}`}
                  </Text>
                );
              }
              return '';
            },
          )}

          {justificationField?.description.length ? (
            <Text style={styles.medicine} wrap>
              {`Justificativa: ${String(justificationField?.description)}`}
            </Text>
          ) : (
            ''
          )}
        </View>
        <View style={styles.manualSignature}>
          {!prescription.prescription.assigned ? (
            <View style={styles.row}></View>
          ) : (
            ''
          )}
          <Text style={styles.doctorSignature}>
            {`${prescription.doctor.name} `}
          </Text>
          <Text style={styles.doctorSignature}>
            {`${RegionalCouncilIdToName[prescription.doctor.councilType]} ${
              prescription.doctor.crm
            } ${prescription.doctor.councilUf}`}
          </Text>
          {prescription.doctor.doctorSpecialty.map((speciality, index) => {
            if (index <= 1) {
              return (
                <Text key={speciality.id} style={styles.doctorSpeciality}>{`${
                  speciality.specialty
                } ${
                  [RegionalCouncilEnum.CMRV, RegionalCouncilEnum.CRM].includes(
                    prescription.doctor.councilType,
                  )
                    ? `${
                        speciality.registrationNumber.length
                          ? `${
                              prescription.doctor.councilType ===
                              RegionalCouncilEnum.CMRV
                                ? '- MAPA'
                                : '- RQE'
                            } ${speciality?.registrationNumber}`
                          : ''
                      }`
                    : ''
                }`}</Text>
              );
            }
          })}
          <Text style={styles.date}>
            {`${formatExtendedDate(new Date())},${
              prescription.doctor.address.city
            } - ${prescription.doctor.address.state}`}
          </Text>
          <View
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Text style={styles.prescriptionCode}>
              {prescription.prescription.assigned
                ? 'Documento assinado digitalmente, acesse assinaturadigital.iti.gov.br para validar a assinatura'
                : ``}
            </Text>
          </View>
        </View>
        <View
          fixed
          style={{
            bottom: '0px',
            width: '100%',
            height: '85px',
            backgroundColor: '#F7F8FA',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingLeft: '80px',
            paddingRight: '80px',
            paddingTop: '10px',
            borderTop: '1px solid #EDEDF3',
            position: 'absolute',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                padding: '0px',
                margin: '0px',
                width: '70%',
              }}
            >
              <Text style={styles.companyName}>
                {prescription.doctor.address.ownerName}
              </Text>
              <Text style={styles.footerInfo}>
                {prescription.doctor.address.cnpj
                  ? `CNPJ: ${prescription.doctor.address.cnpj}`
                  : ''}
              </Text>
              <Text style={[styles.footerInfo, { marginBottom: '10px' }]}>
                {address}
              </Text>
            </View>
            <View style={{ padding: '0px', margin: '0px' }}>
              <Text style={styles.footerInfo}>
                {formatToPhone(String(prescription.doctor.address.ownerPhone))}
              </Text>
              <Text style={styles.footerInfo}>
                {prescription.doctor.address.ownerEmail}
              </Text>
              <Text
                style={styles.footerInfo}
                render={({ pageNumber, totalPages }) =>
                  `Página: ${pageNumber}/${totalPages}`
                }
              ></Text>
            </View>
          </View>

          <View>
            <Text style={styles.footerAlert}>
              Alertamos que no caso da farmácia não aceitar a prescrição por
              falta de dados do paciente, a responsabilidade dessa emissão é
              inteiramente do prescritor.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const generateEmergencyPDF = async (
  prescription: IPrescriptionEmergencyForPrint,
) => {
  try {
    const fileName = generateFileName(
      '',
      prescription.doctor.name,
      prescription.prescription.person.name,
    );
    switch (prescription.prescription.documentTypeId) {
      case DocumentTypeEnum.Receita: {
        await ReactPDF.renderToFile(
          <PrescriptionPDF prescription={prescription} />,
          `${__dirname}/${fileName}`,
        );
        break;
      }
      case DocumentTypeEnum.Atestado: {
        await ReactPDF.renderToFile(
          <CertificatePDF prescription={prescription} />,
          `${__dirname}/${fileName}`,
        );
        break;
      }
      case DocumentTypeEnum.Outros: {
        await ReactPDF.renderToFile(
          <CertificatePDF prescription={prescription} />,
          `${__dirname}/${fileName}`,
        );
        break;
      }
      case DocumentTypeEnum['Pedido de exame']: {
        await ReactPDF.renderToFile(
          <CertificatePDF prescription={prescription} />,
          `${__dirname}/${fileName}`,
        );
        break;
      }
      default:
        throw Error(
          'O documento não se encaixa em nenhum modelo de PDF existente',
        );
    }

    const file = await readFile(`${__dirname}/${fileName}`);

    await rm(`${__dirname}/${fileName}`);

    return {
      buffer: Buffer.from(file).toString('base64'),
      fileName: fileName,
      prescriptionType: prescription.prescription.idPrescriptionType,
    };
  } catch (error) {
    console.log(error);
  }
};
