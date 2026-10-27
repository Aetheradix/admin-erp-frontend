import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Barcode,
  AlertTriangle,
  ArrowUpRight,
  Laptop,
  Cpu,
  X,
} from 'lucide-react';
import type { DashboardInventory } from '@/types/dashboard';
import { useRecordAssetScanMutation } from '@/store/api/dashboardSlice';
import { useGetInventoryItemsQuery } from '@/store/api/inventorySlice';
import { showToast } from '@/components/ui/composed/Toast.utils';
import { broadcastSync } from '@/services/syncService';

interface InventoryOverviewCardProps {
  inventory: DashboardInventory | null;
  isLoading: boolean;
}

export const InventoryOverviewCard: React.FC<InventoryOverviewCardProps> = ({ inventory, isLoading }) => {
  const navigate = useNavigate();
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [scanLocation, setScanLocation] = useState('HQ - 3rd Floor Engineering');

  const { data: inventoryData } = useGetInventoryItemsQuery({ limit: 50 });
  const [recordScan, { isLoading: isScanning }] = useRecordAssetScanMutation();

  if (isLoading || !inventory) {
    return (
      <div className="bg-surface-elevated rounded-3xl p-7 border border-border-subtle shadow-soft animate-pulse h-full">
        <div className="w-28 h-4 rounded-md bg-surface-subtle mb-3" />
        <div className="w-48 h-7 rounded-xl bg-surface-subtle mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 rounded-2xl bg-surface-subtle" />
          <div className="h-24 rounded-2xl bg-surface-subtle" />
        </div>
      </div>
    );
  }

  const {
    totalItems,
    availableItems,
    assignedItems,
    lowStockItems,
    maintenanceItems,
    myAssignedAssets = [],
    myAssignedCount = 0,
    recentScan,
  } = inventory;

  const handlePerformScan = async () => {
    if (!selectedItemId) {
      showToast.error('Please select an asset to verify scan');
      return;
    }

    try {
      const res = await recordScan({
        itemId: selectedItemId,
        location: scanLocation,
      }).unwrap();

      showToast.success(`Scan verified for ${res.data.item.name} (${res.data.item.assetId})`);
      broadcastSync('inventory');
      setShowScanModal(false);
    } catch (err: any) {
      showToast.error(err?.data?.message || 'Failed to record asset scan');
    }
  };

  return (
    <div className="bg-surface-elevated rounded-3xl p-5 sm:p-6 border border-border-subtle shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Hardware & Assets
            </span>
            <h2 className="text-xl font-black text-foreground tracking-tight mt-0.5">
              Inventory & Devices
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScanModal(true)}
              className="px-3 py-1.5 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary-hover transition-colors shadow-sm cursor-pointer">
              <QrCode size={13} />
              <span>Verify / Scan</span>
            </button>
            <button
              onClick={() => navigate('/inventory')}
              className="px-3.5 py-1.5 rounded-2xl bg-surface-subtle hover:bg-surface-elevated border border-border-subtle text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
              <span>View All</span>
              <ArrowUpRight size={13} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Stock Breakdown Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Total Stock */}
          <div
            onClick={() => navigate('/inventory')}
            className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle hover:border-primary/40 transition-all cursor-pointer group">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              Total Assets
            </span>
            <div className="text-xl font-black text-foreground">{totalItems}</div>
            <span className="text-[10px] text-muted font-bold group-hover:text-primary transition-colors flex items-center gap-0.5 mt-0.5">
              <span>All catalog</span> <ArrowUpRight size={10} />
            </span>
          </div>

          {/* Available */}
          <div
            onClick={() => navigate('/inventory?status=Available')}
            className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle hover:border-emerald-400 transition-all cursor-pointer group">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              Available
            </span>
            <div className="text-xl font-black text-emerald-600">{availableItems}</div>
            <span className="text-[10px] text-muted font-bold group-hover:text-emerald-600 transition-colors flex items-center gap-0.5 mt-0.5">
              <span>Deployable</span> <ArrowUpRight size={10} />
            </span>
          </div>

          {/* Assigned */}
          <div
            onClick={() => navigate('/inventory?status=Assigned')}
            className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle hover:border-purple-400 transition-all cursor-pointer group">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              Assigned
            </span>
            <div className="text-xl font-black text-purple-600">{assignedItems}</div>
            <span className="text-[10px] text-muted font-bold group-hover:text-purple-600 transition-colors flex items-center gap-0.5 mt-0.5">
              <span>With staff</span> <ArrowUpRight size={10} />
            </span>
          </div>

          {/* Under Maintenance / Low Stock */}
          <div
            onClick={() => navigate('/inventory?status=Under+Maintenance')}
            className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle hover:border-amber-400 transition-all cursor-pointer group">
            <span className="text-[9px] font-black uppercase tracking-wider text-muted block mb-1">
              Maintenance
            </span>
            <div className="text-xl font-black text-amber-600">{maintenanceItems}</div>
            <span className="text-[10px] text-muted font-bold group-hover:text-amber-600 transition-colors flex items-center gap-0.5 mt-0.5">
              <span>In service</span> <ArrowUpRight size={10} />
            </span>
          </div>
        </div>

        {/* My Assigned Assets Strip */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Laptop size={12} className="text-primary" />
              <span>My Assigned Devices ({myAssignedCount})</span>
            </span>
            {myAssignedCount > 0 && (
              <span className="text-[10px] font-bold text-primary hover:underline cursor-pointer" onClick={() => navigate('/inventory')}>
                Manage
              </span>
            )}
          </div>

          {myAssignedAssets.length > 0 ? (
            <div className="space-y-2">
              {myAssignedAssets.map((asset) => (
                <div
                  key={`asset-${asset.id}`}
                  onClick={() => navigate('/inventory')}
                  className="p-3 rounded-2xl bg-surface-subtle border border-border-subtle hover:border-primary/30 transition-all flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">{asset.name}</h4>
                      <p className="text-[10px] text-muted font-medium">
                        {asset.assetId} · Serial: {asset.serialNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {asset.conditionStatus || 'Good'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-subtle/60 border border-border-subtle text-center">
              <p className="text-xs text-muted font-medium">No company assets currently assigned to your account.</p>
            </div>
          )}
        </div>

        {/* Barcode/QR Recent Scan History */}
        <div className="p-4 rounded-2xl bg-surface-subtle/80 border border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Barcode size={14} className="text-primary" />
              <span>Latest Barcode / QR Scan Activity</span>
            </span>
            {recentScan && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                VERIFIED
              </span>
            )}
          </div>

          {recentScan ? (
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-black text-foreground">{recentScan.itemName}</h5>
                <p className="text-[11px] text-muted font-medium mt-0.5">
                  Asset ID: <span className="font-bold text-foreground">{recentScan.assetId || 'ID #' + recentScan.itemId}</span> · Scanned by {recentScan.userName}
                </p>
                <span className="text-[10px] text-muted/70 block mt-0.5">
                  {new Date(recentScan.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <button
                onClick={() => navigate('/inventory')}
                className="p-2 rounded-xl bg-surface-elevated border border-border-subtle hover:border-primary/40 text-muted hover:text-primary transition-colors cursor-pointer"
                title="View in inventory">
                <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-muted">
              <span>No recent asset scans logged in the database yet.</span>
              <button
                onClick={() => setShowScanModal(true)}
                className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline cursor-pointer">
                Scan Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between text-[11px] text-muted">
        <span className="font-medium">
          {lowStockItems > 0 ? (
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <AlertTriangle size={12} /> {lowStockItems} items require restocking
            </span>
          ) : (
            'Inventory stock records synced'
          )}
        </span>
        <button
          onClick={() => navigate('/inventory')}
          className="text-primary hover:underline font-black text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1">
          <span>Go to Inventory</span>
          <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Quick Barcode/QR Verification Modal */}
      <AnimatePresence>
        {showScanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface-elevated rounded-3xl p-6 border border-border-subtle shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <QrCode size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground">Verify Asset / Barcode</h3>
                    <p className="text-[11px] text-muted">Records verified scan in inventory audit trail</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScanModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-muted hover:text-foreground cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 my-4">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted block mb-1.5">
                    Select Asset to Verify
                  </label>
                  <select
                    value={selectedItemId || ''}
                    onChange={(e) => setSelectedItemId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-subtle border border-border-subtle text-xs font-bold text-foreground outline-none focus:border-primary">
                    <option value="">-- Choose an item from database --</option>
                    {inventoryData?.items?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.asset_id || '#' + item.id}) - {item.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted block mb-1.5">
                    Scan Location
                  </label>
                  <input
                    type="text"
                    value={scanLocation}
                    onChange={(e) => setScanLocation(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-surface-subtle border border-border-subtle text-xs font-bold text-foreground outline-none focus:border-primary"
                    placeholder="e.g. HQ - 2nd Floor Workshop"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border-subtle">
                <button
                  onClick={() => setShowScanModal(false)}
                  className="px-4 py-2 rounded-2xl bg-surface-subtle text-muted text-xs font-bold hover:text-foreground cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handlePerformScan}
                  disabled={isScanning || !selectedItemId}
                  className="px-5 py-2 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary-hover disabled:opacity-50 cursor-pointer shadow-sm">
                  {isScanning ? 'Recording Scan...' : 'Record Verified Scan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
