'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, UserPlus, Mail, Download, Settings } from 'lucide-react';

interface Guest {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  statut: 'INVITED' | 'CONFIRMED' | 'DECLINED';
  tableId: number | null;
  regimeAlimentaire: string;
}

interface Table {
  id: number;
  nom: string;
  capacite: number;
  position: { x: number; y: number };
}

const WeddingGuestManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [guests, setGuests] = useState<Guest[]>([
    { id: 1, nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@email.com', statut: 'CONFIRMED', tableId: 1, regimeAlimentaire: 'Végétarien' },
    { id: 2, nom: 'Martin', prenom: 'Pierre', email: 'pierre.martin@email.com', statut: 'CONFIRMED', tableId: 1, regimeAlimentaire: '' },
    { id: 3, nom: 'Bernard', prenom: 'Sophie', email: 'sophie.bernard@email.com', statut: 'INVITED', tableId: null, regimeAlimentaire: 'Sans gluten' },
    { id: 4, nom: 'Rousseau', prenom: 'Jean', email: 'jean.rousseau@email.com', statut: 'CONFIRMED', tableId: 2, regimeAlimentaire: '' },
    { id: 5, nom: 'Leroy', prenom: 'Claire', email: 'claire.leroy@email.com', statut: 'DECLINED', tableId: null, regimeAlimentaire: '' },
    { id: 6, nom: 'Moreau', prenom: 'Antoine', email: 'antoine.moreau@email.com', statut: 'CONFIRMED', tableId: null, regimeAlimentaire: 'Végétalien' },
  ]);
  
  const [tables, setTables] = useState<Table[]>([
    { id: 1, nom: 'Table Famille', capacite: 8, position: { x: 100, y: 150 } },
    { id: 2, nom: 'Table Amis', capacite: 10, position: { x: 300, y: 150 } },
    { id: 3, nom: 'Table Collègues', capacite: 8, position: { x: 500, y: 150 } },
    { id: 4, nom: 'Table Enfants', capacite: 6, position: { x: 200, y: 300 } },
  ]);

  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);
  const [newGuest, setNewGuest] = useState({ nom: '', prenom: '', email: '', regimeAlimentaire: '' });
  const [showAddGuest, setShowAddGuest] = useState(false);

  // Sauvegarder dans localStorage
  useEffect(() => {
    const savedGuests = localStorage.getItem('wedding-guests');
    const savedTables = localStorage.getItem('wedding-tables');
    
    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    }
    if (savedTables) {
      setTables(JSON.parse(savedTables));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wedding-guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('wedding-tables', JSON.stringify(tables));
  }, [tables]);

  const handleDragStart = (e: React.DragEvent, guest: Guest) => {
    setDraggedGuest(guest);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, tableId: number) => {
    e.preventDefault();
    if (draggedGuest) {
      setGuests(guests.map(guest => 
        guest.id === draggedGuest.id 
          ? { ...guest, tableId: tableId }
          : guest
      ));
      setDraggedGuest(null);
    }
  };

  const handleDropToUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedGuest) {
      setGuests(guests.map(guest => 
        guest.id === draggedGuest.id 
          ? { ...guest, tableId: null }
          : guest
      ));
      setDraggedGuest(null);
    }
  };

  const addGuest = () => {
    if (newGuest.nom && newGuest.prenom && newGuest.email) {
      const id = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
      setGuests([...guests, {
        id,
        ...newGuest,
        statut: 'INVITED' as const,
        tableId: null
      }]);
      setNewGuest({ nom: '', prenom: '', email: '', regimeAlimentaire: '' });
      setShowAddGuest(false);
    }
  };

  const deleteGuest = (id: number) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const updateGuestStatus = (id: number, newStatus: Guest['statut']) => {
    setGuests(guests.map(guest => 
      guest.id === id ? { ...guest, statut: newStatus } : guest
    ));
  };

  const getGuestsByTable = (tableId: number) => {
    return guests.filter(guest => guest.tableId === tableId && guest.statut === 'CONFIRMED');
  };

  const getUnassignedGuests = () => {
    return guests.filter(guest => !guest.tableId && guest.statut === 'CONFIRMED');
  };

  const getStatusColor = (statut: Guest['statut']) => {
    switch(statut) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Dashboard Statistics
  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.statut === 'CONFIRMED').length,
    pending: guests.filter(g => g.statut === 'INVITED').length,
    declined: guests.filter(g => g.statut === 'DECLINED').length,
    assigned: guests.filter(g => g.tableId && g.statut === 'CONFIRMED').length,
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Total Invités</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Confirmés</p>
              <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">?</span>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold">📍</span>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600">Placés</p>
              <p className="text-2xl font-bold text-purple-900">{stats.assigned}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Résumé par table</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map(table => {
            const tableGuests = getGuestsByTable(table.id);
            return (
              <div key={table.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{table.nom}</h4>
                  <span className="text-sm text-gray-500">
                    {tableGuests.length}/{table.capacite}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(tableGuests.length / table.capacite) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderGuestList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des Invités</h2>
        <button
          onClick={() => setShowAddGuest(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          <span>Ajouter un invité</span>
        </button>
      </div>

      {showAddGuest && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">Nouvel invité</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom"
              value={newGuest.nom}
              onChange={(e) => setNewGuest({...newGuest, nom: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Prénom"
              value={newGuest.prenom}
              onChange={(e) => setNewGuest({...newGuest, prenom: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={newGuest.email}
              onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Régime alimentaire"
              value={newGuest.regimeAlimentaire}
              onChange={(e) => setNewGuest({...newGuest, regimeAlimentaire: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={addGuest}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddGuest(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium">Nom</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Statut</th>
              <th className="text-left p-4 font-medium">Table</th>
              <th className="text-left p-4 font-medium">Régime</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map(guest => (
              <tr key={guest.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium">{guest.prenom} {guest.nom}</div>
                </td>
                <td className="p-4 text-gray-600">{guest.email}</td>
                <td className="p-4">
                  <select
                    value={guest.statut}
                    onChange={(e) => updateGuestStatus(guest.id, e.target.value as Guest['statut'])}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.statut)}`}
                  >
                    <option value="INVITED">Invité</option>
                    <option value="CONFIRMED">Confirmé</option>
                    <option value="DECLINED">Refusé</option>
                  </select>
                </td>
                <td className="p-4">
                  {guest.tableId ? 
                    tables.find(t => t.id === guest.tableId)?.nom || 'Table inconnue' 
                    : <span className="text-gray-400">Non assigné</span>
                  }
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {guest.regimeAlimentaire || '-'}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteGuest(guest.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTablePlan = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Plan de Table</h2>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700">
            <Download className="h-4 w-4" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone des invités non assignés */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium mb-4 text-gray-700">Invités non assignés ({getUnassignedGuests().length})</h3>
            <div
              className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-2 space-y-2"
              onDragOver={handleDragOver}
              onDrop={handleDropToUnassigned}
            >
              {getUnassignedGuests().map(guest => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, guest)}
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm cursor-move hover:bg-blue-200 transition-colors"
                >
                  {guest.prenom} {guest.nom}
                  {guest.regimeAlimentaire && (
                    <div className="text-xs text-blue-600 mt-1">
                      🥗 {guest.regimeAlimentaire}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone du plan de table */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border p-6" style={{ minHeight: '600px' }}>
            <div className="relative w-full h-full">
              {tables.map(table => {
                const tableGuests = getGuestsByTable(table.id);
                return (
                  <div
                    key={table.id}
                    className="absolute border-2 border-gray-300 rounded-lg bg-white shadow-lg p-4"
                    style={{
                      left: table.position.x,
                      top: table.position.y,
                      width: '200px',
                      minHeight: '150px'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, table.id)}
                  >
                    <div className="text-center mb-3">
                      <h4 className="font-medium text-gray-800">{table.nom}</h4>
                      <p className="text-xs text-gray-500">
                        {tableGuests.length}/{table.capacite} places
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      {tableGuests.map(guest => (
                        <div
                          key={guest.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, guest)}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs cursor-move hover:bg-green-200 transition-colors"
                        >
                          {guest.prenom} {guest.nom}
                          {guest.regimeAlimentaire && (
                            <span className="text-green-600 ml-1">🥗</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {tableGuests.length >= table.capacite && (
                      <div className="text-xs text-red-600 mt-2 text-center">
                        ⚠️ Table complète
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Astuce :</strong> Glissez-déposez les invités entre les tables ou vers la zone "non assignés" pour les réorganiser facilement.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💒</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Mariage - Gestion des Invités</h1>
            </div>
            <div className="text-sm text-gray-500">
              {stats.confirmed} confirmés sur {stats.total} invités
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
              { id: 'guests', label: 'Invités', icon: '👥' },
              { id: 'tables', label: 'Plan de table', icon: '🪑' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'guests' && renderGuestList()}
        {activeTab === 'tables' && renderTablePlan()}
      </main>
    </div>
  );
};

export default WeddingGuestManager;