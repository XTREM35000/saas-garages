import { DatabaseOrganization, DatabaseGarage } from '@/types/database';
import { OrganizationWithGarages } from '@/types/organization';

export const mapDatabaseOrgToOrganization = (
  dbOrg: DatabaseOrganization
): OrganizationWithGarages => ({
  id: dbOrg.id,
  name: dbOrg.name,
  created_at: dbOrg.created_at,
  user_id: dbOrg.owner_id,
  garages: dbOrg.garages || []
});