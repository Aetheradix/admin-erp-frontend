import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { Package } from 'lucide-react';
import type { AssignedAssetItem } from '@/types/dashboard';
import { WorkDeliveryEmpty, WorkDeliveryList, WorkDeliveryRow } from './WorkDeliveryPrimitives';

export function AssetsTab({ assets }: { assets: AssignedAssetItem[] }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col pt-1">
      {assets.length === 0 ? (
        <WorkDeliveryEmpty
          icon={Package}
          title="No hardware or inventory assets assigned yet"
          action={
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer">
              View Inventory Catalog
            </button>
          }
        />
      ) : (
        <WorkDeliveryList padded={false}>
          {assets.map((asset) => (
            <WorkDeliveryRow key={asset.id} onClick={() => navigate('/inventory')}>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate">{asset.name}</h4>
                <p className="text-[10px] text-muted mt-0.5">
                  ID: <span className="font-mono text-foreground font-bold">{asset.assetId}</span> •{' '}
                  {asset.category}
                </p>
              </div>
              <Tag color="blue" className="text-[9px] font-bold border-none m-0 rounded-md">
                {asset.conditionStatus || 'Assigned'}
              </Tag>
            </WorkDeliveryRow>
          ))}
        </WorkDeliveryList>
      )}
    </div>
  );
}