'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProperties } from '@/hooks/useProperties';

export default function NewPropertyPage() {
  const router = useRouter();
  const { createProperty } = useProperties();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [lotSize, setLotSize] = useState('');
  const [builtSize, setBuiltSize] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [houseAge, setHouseAge] = useState('');
  const [parking, setParking] = useState('');
  const [hasGarden, setHasGarden] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [additionalFeatures, setAdditionalFeatures] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const property = await createProperty({
        title, address, city,
        current_price: Number(price),
        description,
        details: {
          lot_size_sqm: lotSize ? Number(lotSize) : undefined,
          built_size_sqm: builtSize ? Number(builtSize) : undefined,
          bedrooms: bedrooms ? Number(bedrooms) : undefined,
          bathrooms: bathrooms ? Number(bathrooms) : undefined,
          house_age_years: houseAge ? Number(houseAge) : undefined,
          parking_spaces: parking ? Number(parking) : undefined,
          has_garden: hasGarden,
          has_balcony: hasBalcony,
          has_pool: hasPool,
          additional_features: additionalFeatures || undefined,
        },
      });
      setLoading(false);
      router.push(`/properties/${property.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה ביצירת הנכס');
      setLoading(false);
    }
  }

  const inp = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";
  const lbl = "block text-sm text-gray-400 mb-1";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors text-lg">←</button>
        <h1 className="text-xl font-bold text-white">נכס חדש</h1>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step === s ? 'bg-blue-600 text-white' : step > s ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'
            }`}>{step > s ? '✓' : s}</div>
            <span className={`text-sm ${step === s ? 'text-white' : 'text-gray-500'}`}>
              {s === 1 ? 'פרטים בסיסיים' : 'מפרט הנכס'}
            </span>
            {s < 2 && <div className="w-8 h-px bg-gray-700 mx-2" />}
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={lbl}>כותרת הנכס *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="דירת 4 חדרים במרכז תל אביב" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>עיר *</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="תל אביב" className={inp} />
              </div>
              <div>
                <label className={lbl}>כתובת *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="רחוב דיזנגוף 10" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>מחיר מבוקש (₪) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="2000000" className={inp} />
            </div>
            <div>
              <label className={lbl}>תיאור חופשי</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="תאר את הנכס..." className={inp + ' resize-none'} />
            </div>
            <button onClick={() => setStep(2)} disabled={!title || !city || !address || !price}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors">
              המשך →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'שטח מגרש (מ"ר)', val: lotSize, set: setLotSize, ph: '500' },
                { label: 'שטח בנוי (מ"ר)', val: builtSize, set: setBuiltSize, ph: '120' },
                { label: 'חדרים', val: bedrooms, set: setBedrooms, ph: '4' },
                { label: 'חדרי אמבטיה', val: bathrooms, set: setBathrooms, ph: '2' },
                { label: 'גיל הנכס (שנים)', val: houseAge, set: setHouseAge, ph: '10' },
                { label: 'חניות', val: parking, set: setParking, ph: '1' },
              ].map(f => (
                <div key={f.label}>
                  <label className={lbl}>{f.label}</label>
                  <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className={inp} />
                </div>
              ))}
            </div>

            <div>
              <label className={lbl}>מאפיינים</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: '🌿 גינה', val: hasGarden, set: setHasGarden },
                  { label: '🏗 מרפסת', val: hasBalcony, set: setHasBalcony },
                  { label: '🏊 בריכה', val: hasPool, set: setHasPool },
                ].map(item => (
                  <button key={item.label} type="button" onClick={() => item.set(!item.val)}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      item.val ? 'border-blue-500 bg-blue-600/20 text-blue-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={lbl}>פרטים נוספים</label>
              <textarea value={additionalFeatures} onChange={e => setAdditionalFeatures(e.target.value)} rows={3}
                placeholder='מיזוג, דוד שמש, ממ"ד...' className={inp + ' resize-none'} />
            </div>

            {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg transition-colors">← חזור</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-lg transition-colors">
                {loading ? '...' : 'צור נכס ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
