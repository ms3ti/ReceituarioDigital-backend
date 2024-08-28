export class IUpdatePrescriptionCompositionModelDto {
  activePrinciple: string | null;
  description: string;
  dosage: string | null;
  medicine: string | null;
  packing: string | null;
  isOrientation: boolean;
  isContent: boolean;
  isTitle: boolean;
  id: number;
}
