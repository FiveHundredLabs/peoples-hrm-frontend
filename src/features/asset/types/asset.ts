export interface AssetCategory {
  id: string;
  code: string;
  name: string;
  assets?: Asset[];
}

export interface Asset {
  id: string;
  legalEntityId?: string | null;
  assetCategoryId: string;
  assetTag: string;
  name: string;
  serialNumber?: string | null;
  make?: string | null;
  model?: string | null;
  purchaseDate?: string | null;
  purchaseCost?: number | null;
  currency: string;
  status: 'available' | 'assigned' | 'maintenance' | 'lost' | 'damaged' | 'retired';
  branchId?: string | null;
  notes?: string | null;
  category?: AssetCategory;
  branch?: { id: string; name: string };
  assignments?: AssetAssignment[];
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  issuedOn: string;
  expectedReturnOn?: string | null;
  returnedOn?: string | null;
  issueCondition?: string | null;
  returnCondition?: string | null;
  issuedByUserId?: string | null;
  receivedByUserId?: string | null;
  notes?: string | null;
  asset?: Asset;
  employee?: { id: string; displayName: string; employeeNumber: string };
}
