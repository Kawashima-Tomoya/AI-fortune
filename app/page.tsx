'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function FortuneCard() {
  const [birthDate, setBirthDate] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [fortune, setFortune] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayKey = (birthDate: string, bloodType: string) => {
    const t = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `fortune:${birthDate}:${bloodType}:${t}`;
  };

  const handleSubmit = async () => {
    setError(null);

    console.log("Sending:", { birthDate, bloodType }); // 確認
    
    if (!birthDate) return setError('生年月日を選んでください。');
    if (!bloodType) return setError('血液型を選んでください。');

    const key = todayKey(birthDate, bloodType);
    const cached = localStorage.getItem(key);
    if (cached) {
      setFortune(cached);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate, bloodType }),
      });
      if (!res.ok) throw new Error('サーバーエラー');
      const data = await res.json();
      console.log(data);
      
      if (data?.fortune) {
        setFortune(data.fortune);
        localStorage.setItem(key, data.fortune);
      } else {
        throw new Error('占いの結果が得られませんでした。');
      }
    } catch (e: any) {
      setError(e.message || '通信エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">今日のAI占い🔮</h1>

      <div>
        <label className="block">
          <div className="text-sm">生年月日</div>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-1 w-full border rounded px-4 py-3"
          />
        </label>
      </div>

      <div>
        <label className="block">
          <div className="text-sm">血液型</div>
        </label>
        <div className="grid grid-cols-4 gap-3 mt-1">
          {['A', 'B', 'O', 'AB'].map((type) => (
            <Button
              key={type}
              onClick={() => setBloodType(type)}
              className={`py-6 font-semibold transition ${
                bloodType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}型
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-purple-600 text-white py-6 rounded disabled:opacity-50 col-span-2 text-lg"
        >
          {loading ? '占っています...' : '占う'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setBirthDate('');
            setBloodType('');
            setFortune(null);
            setError(null);
          }}
          className="px-4 py-6 rounded"
        >
          リセット
        </Button>
      </div>

      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {fortune && (
        <div className="mt-4 p-4 bg-gray-50 border rounded shadow-sm">
          <p className="text-lg">{fortune}</p>
        </div>
      )}
    </div>
  );
}
