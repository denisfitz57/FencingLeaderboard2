
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Weapon, Fencer, Bout, BoutsByWeapon, LeaderboardEntry } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { calculateLeaderboard } from './services/leaderboardCalculator';
import Leaderboard from './components/Leaderboard';
import Modal from './components/Modal';
import { SwordsIcon, PlusIcon, UsersIcon, HistoryIcon, TrashIcon } from './constants';

const App: React.FC = () => {
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(Weapon.Epee);
  const [modal, setModal] = useState<string | null>(null);
  
  const [fencers, setFencers] = usePersistentState<Fencer[]>('fencers', []);
  const [bouts, setBouts] = usePersistentState<BoutsByWeapon>('bouts', {
    [Weapon.Epee]: [],
    [Weapon.Foil]: [],
    [Weapon.Sabre]: [],
  });
  
  // State for forms
  const [newFencerName, setNewFencerName] = useState('');
  const [boutToEdit, setBoutToEdit] = useState<Bout | null>(null);
  
  const [fencer1Id, setFencer1Id] = useState('');
  const [fencer2Id, setFencer2Id] = useState('');
  const [refereeId, setRefereeId] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [boutDate, setBoutDate] = useState(new Date().toISOString().split('T')[0]);

  const leaderboardData = useMemo(() => {
    return calculateLeaderboard(bouts[currentWeapon], fencers);
  }, [bouts, fencers, currentWeapon]);

  const fencerMap = useMemo(() => {
    return new Map(fencers.map(f => [f.id, f.name]));
  }, [fencers]);

  const resetBoutForm = useCallback(() => {
    setFencer1Id('');
    setFencer2Id('');
    setRefereeId('');
    setScore1(0);
    setScore2(0);
    setBoutDate(new Date().toISOString().split('T')[0]);
    setBoutToEdit(null);
  }, []);

  useEffect(() => {
    if (boutToEdit) {
      setFencer1Id(boutToEdit.fencer1Id);
      setFencer2Id(boutToEdit.fencer2Id);
      setRefereeId(boutToEdit.refereeId);
      setScore1(boutToEdit.score1);
      setScore2(boutToEdit.score2);
      setBoutDate(new Date(boutToEdit.date).toISOString().split('T')[0]);
      setModal('addBout');
    } else {
      resetBoutForm();
    }
  }, [boutToEdit, resetBoutForm]);

  const handleAddFencer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFencerName.trim() && !fencers.some(f => f.name === newFencerName.trim())) {
      setFencers(prev => [...prev, { id: crypto.randomUUID(), name: newFencerName.trim() }]);
      setNewFencerName('');
    }
  };

  const handleDeleteFencer = (id: string) => {
    if(window.confirm('Are you sure? This will also remove all bouts involving this fencer.')) {
        setFencers(prev => prev.filter(f => f.id !== id));
        // Also remove bouts involving this fencer
        const newBouts = { ...bouts };
        for (const w in newBouts) {
            const weaponKey = w as Weapon;
            newBouts[weaponKey] = newBouts[weaponKey].filter(b => 
                b.fencer1Id !== id && b.fencer2Id !== id && b.refereeId !== id
            );
        }
        setBouts(newBouts);
    }
  };

  const handleBoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fencer1Id || !fencer2Id || !refereeId || fencer1Id === fencer2Id) {
        alert("Please select two different fencers and a referee.");
        return;
    }

    const newBout: Bout = {
      id: boutToEdit ? boutToEdit.id : crypto.randomUUID(),
      date: new Date(boutDate).toISOString(),
      weapon: currentWeapon,
      fencer1Id,
      fencer2Id,
      refereeId,
      score1: Number(score1),
      score2: Number(score2),
    };

    setBouts(prev => {
        const weaponBouts = prev[currentWeapon] || [];
        if (boutToEdit) {
            return {
                ...prev,
                [currentWeapon]: weaponBouts.map(b => b.id === newBout.id ? newBout : b)
            }
        }
        return {
            ...prev,
            [currentWeapon]: [...weaponBouts, newBout]
        };
    });
    setModal(null);
    resetBoutForm();
  };
  
  const handleDeleteBout = (id: string) => {
    setBouts(prev => ({
        ...prev,
        [currentWeapon]: prev[currentWeapon].filter(b => b.id !== id)
    }))
  };

  const openAddBoutModal = () => {
    resetBoutForm();
    setModal('addBout');
  };

  const availableFencersForBout = fencers.filter(f => f.id !== fencer1Id && f.id !== fencer2Id);

  return (
    <div className="min-h-screen bg-primary font-sans">
      <header className="bg-secondary p-4 shadow-lg flex items-center justify-center space-x-4">
        <SwordsIcon className="w-8 h-8 text-accent"/>
        <h1 className="text-3xl font-bold tracking-wider text-light">Fencing Leaderboard</h1>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Weapon Tabs */}
        <div className="flex justify-center mb-8 bg-secondary rounded-lg p-1 max-w-md mx-auto">
          {Object.values(Weapon).map(weapon => (
            <button
              key={weapon}
              onClick={() => setCurrentWeapon(weapon)}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-md transition-all duration-300 ${
                currentWeapon === weapon
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-transparent text-gray-400 hover:bg-primary/50'
              }`}
            >
              {weapon}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button onClick={openAddBoutModal} className="flex items-center gap-2 bg-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
            <PlusIcon className="w-5 h-5"/> Add Bout Result
          </button>
          <button onClick={() => setModal('manageFencers')} className="flex items-center gap-2 bg-secondary hover:bg-primary/80 text-light font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
            <UsersIcon className="w-5 h-5"/> Manage Fencers
          </button>
          <button onClick={() => setModal('manageBouts')} className="flex items-center gap-2 bg-secondary hover:bg-primary/80 text-light font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
             <HistoryIcon className="w-5 h-5"/> Bout History
          </button>
        </div>

        <Leaderboard data={leaderboardData} />
      </main>
      
      {/* Add/Edit Bout Modal */}
      <Modal isOpen={modal === 'addBout'} onClose={() => { setModal(null); setBoutToEdit(null); }} title={boutToEdit ? "Edit Bout" : "Add New Bout"}>
        <form onSubmit={handleBoutSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4 items-center">
                 <select value={fencer1Id} onChange={e => setFencer1Id(e.target.value)} required className="w-full p-2 bg-primary border border-gray-600 rounded-md focus:ring-accent focus:border-accent">
                    <option value="">Fencer 1</option>
                    {fencers.filter(f => f.id !== fencer2Id).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                 <select value={fencer2Id} onChange={e => setFencer2Id(e.target.value)} required className="w-full p-2 bg-primary border border-gray-600 rounded-md focus:ring-accent focus:border-accent">
                    <option value="">Fencer 2</option>
                    {fencers.filter(f => f.id !== fencer1Id).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-5 gap-2 items-center text-center">
                <input type="number" value={score1} onChange={e => setScore1(parseInt(e.target.value))} min="0" max="15" required className="w-full p-2 bg-primary border border-gray-600 rounded-md text-center"/>
                <span className="col-span-3 font-bold text-lg">Score</span>
                <input type="number" value={score2} onChange={e => setScore2(parseInt(e.target.value))} min="0" max="15" required className="w-full p-2 bg-primary border border-gray-600 rounded-md text-center"/>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Referee</label>
                 <select value={refereeId} onChange={e => setRefereeId(e.target.value)} required className="w-full p-2 bg-primary border border-gray-600 rounded-md focus:ring-accent focus:border-accent">
                    <option value="">Select Referee</option>
                    {fencers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>
             <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                 <input type="date" value={boutDate} onChange={e => setBoutDate(e.target.value)} required className="w-full p-2 bg-primary border border-gray-600 rounded-md"/>
             </div>
            <button type="submit" className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 mt-4">
                {boutToEdit ? "Update Bout" : "Save Bout"}
            </button>
        </form>
      </Modal>

      {/* Manage Fencers Modal */}
      <Modal isOpen={modal === 'manageFencers'} onClose={() => setModal(null)} title="Manage Fencers">
        <form onSubmit={handleAddFencer} className="flex gap-2 mb-4">
            <input type="text" value={newFencerName} onChange={e => setNewFencerName(e.target.value)} placeholder="New fencer name..." className="flex-grow p-2 bg-primary border border-gray-600 rounded-md focus:ring-accent focus:border-accent"/>
            <button type="submit" className="bg-accent hover:bg-blue-500 text-white font-bold p-2 rounded-lg">
                <PlusIcon />
            </button>
        </form>
        <ul className="space-y-2 max-h-80 overflow-y-auto">
            {fencers.map(fencer => (
                <li key={fencer.id} className="flex justify-between items-center bg-primary p-2 rounded-md">
                    <span>{fencer.name}</span>
                    <button onClick={() => handleDeleteFencer(fencer.id)} className="text-red-500 hover:text-red-400 p-1">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </li>
            ))}
        </ul>
      </Modal>

      {/* Bout History Modal */}
      <Modal isOpen={modal === 'manageBouts'} onClose={() => setModal(null)} title={`${currentWeapon} Bout History`}>
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {bouts[currentWeapon].length > 0 ? (
                [...bouts[currentWeapon]].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(bout => (
                <div key={bout.id} className="bg-primary p-3 rounded-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{fencerMap.get(bout.fencer1Id)} vs {fencerMap.get(bout.fencer2Id)}</p>
                            <p className="text-2xl font-bold text-accent">{bout.score1} - {bout.score2}</p>
                            <p className="text-sm text-gray-400">{new Date(bout.date).toLocaleDateString()} | Ref: {fencerMap.get(bout.refereeId)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <button onClick={() => { setBoutToEdit(bout); }} className="text-sm bg-accent/20 hover:bg-accent/40 text-accent font-semibold py-1 px-3 rounded-md">
                                Edit
                            </button>
                           <button onClick={() => handleDeleteBout(bout.id)} className="text-red-500 hover:text-red-400 p-1">
                                <TrashIcon className="w-5 h-5"/>
                           </button>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <p className="text-gray-400 text-center">No bouts recorded for {currentWeapon}.</p>
            )}
        </div>
      </Modal>
    </div>
  );
};

export default App;
