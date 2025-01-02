import { useState } from 'react'
import { calculateSettlements } from './utils/settlements'
import {type Player, type CombinedSettlement} from './utils/types/settlement'

function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayer, setNewPlayer] = useState<Player>({
    id: Date.now(),
    name: '',
    buyIn: 0,
    cashOut: 0,
    isHouse: false,
    expenses: 0
  })
  const [houseFee, setHouseFee] = useState(0)
  const [settlements, setSettlements] = useState<CombinedSettlement[]>([])

  const addPlayer = () => {
    if (newPlayer.name.trim() === '') return
    setPlayers([...players, { ...newPlayer, id: Date.now() }])
    setNewPlayer({
      id: Date.now(),
      name: '',
      buyIn: 0,
      cashOut: 0,
      isHouse: false,
      expenses: 0
    })
    setSettlements([]) // Reset settlements when adding a new player
  }

  const removePlayer = (id: number) => {
    setPlayers(players.filter(player => player.id !== id))
    setSettlements([]) // Reset settlements when removing a player
  }

  const handleCalculateSettlements = () => {
    setSettlements(calculateSettlements(players, houseFee))
  }

  const getBreakdownText = (reason: 'house_fee' | 'game_balance' | 'shared_expense') => {
    switch (reason) {
      case 'house_fee':
        return 'עמלת בית'
      case 'game_balance':
        return 'רווח/הפסד'
      case 'shared_expense':
        return 'הוצאות משותפות'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-[#1b4d3e] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#ffd700] font-serif">מחשבון רווחי פוקר</h1>
        
        {/* House Fee Input */}
        <div className="bg-[#133529] p-6 rounded-lg shadow-xl border border-[#ffd700]/20 mb-8">
          <div className="flex items-center gap-4">
            <label htmlFor="houseFee" className="text-[#ffd700] font-semibold">עמלת בית לשחקן:</label>
            <input
              type="number"
              id="houseFee"
              placeholder="הכנס סכום"
              className="w-32 p-2 rounded bg-[#0c231c] border border-[#ffd700]/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700]"
              value={houseFee || ''}
              onChange={(e) => setHouseFee(Number(e.target.value))}
            />
            <span className="text-gray-300 text-sm">
              * כל שחקן רגיל ישלם את הסכום הזה, שיתחלק בין שחקני הבית
            </span>
          </div>
        </div>
        
        {/* Add Player Form */}
        <div className="bg-[#133529] p-6 rounded-lg shadow-xl border border-[#ffd700]/20 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">הוסף שחקן</h2>
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="שם השחקן"
              className="flex-1 min-w-[200px] p-2 rounded bg-[#0c231c] border border-[#ffd700]/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700]"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="קנייה"
              className="flex-1 min-w-[150px] p-2 rounded bg-[#0c231c] border border-[#ffd700]/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700]"
              value={newPlayer.buyIn || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, buyIn: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="יציאה"
              className="flex-1 min-w-[150px] p-2 rounded bg-[#0c231c] border border-[#ffd700]/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700]"
              value={newPlayer.cashOut || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, cashOut: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="הוצאות משותפות"
              className="flex-1 min-w-[150px] p-2 rounded bg-[#0c231c] border border-[#ffd700]/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#ffd700]"
              value={newPlayer.expenses || ''}
              onChange={(e) => setNewPlayer({ ...newPlayer, expenses: Number(e.target.value) })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHouse"
                className="w-4 h-4 rounded border-[#ffd700]/20 bg-[#0c231c]"
                checked={newPlayer.isHouse}
                onChange={(e) => setNewPlayer({ ...newPlayer, isHouse: e.target.checked })}
              />
              <label htmlFor="isHouse" className="text-[#ffd700]">שחקן בית</label>
            </div>
            <button
              onClick={addPlayer}
              className="bg-[#ffd700] text-[#0c231c] px-6 py-2 rounded font-semibold hover:bg-[#ffed4a] transition-colors"
            >
              הוסף שחקן
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-[#133529] p-6 rounded-lg shadow-xl border border-[#ffd700]/20 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">שחקנים</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ffd700]/20">
                  <th className="text-right p-2 text-[#ffd700]">שם</th>
                  <th className="text-right p-2 text-[#ffd700]">קנייה</th>
                  <th className="text-right p-2 text-[#ffd700]">יציאה</th>
                  <th className="text-right p-2 text-[#ffd700]">נטו</th>
                  <th className="text-right p-2 text-[#ffd700]">הוצאות</th>
                  <th className="text-right p-2 text-[#ffd700]">פוג</th>
                  <th className="text-right p-2 text-[#ffd700]">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-b border-[#ffd700]/10">
                    <td className="p-2 text-white">{player.name}</td>
                    <td className="p-2 text-white">₪{player.buyIn}</td>
                    <td className="p-2 text-white">₪{player.cashOut}</td>
                    <td className="p-2">
                      <span className={player.cashOut - player.buyIn >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        ₪{(player.cashOut - player.buyIn).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-2 text-white">₪{player.expenses || 0}</td>
                    <td className="p-2 text-white">
                      {player.isHouse ? 'שחקן בית' : 'שחקן רגיל'}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        הסר
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {players.length > 0 && (
            <button
              onClick={handleCalculateSettlements}
              className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded font-semibold hover:bg-emerald-500 transition-colors"
            >
              חשב התחשבנות
            </button>
          )}
        </div>

        {/* Settlements */}
        {settlements.length > 0 && (
          <div className="bg-[#133529] p-6 rounded-lg shadow-xl border border-[#ffd700]/20">
            <h2 className="text-xl font-semibold mb-4 text-[#ffd700]">התחשבנות</h2>
            <div className="space-y-4">
              {settlements.map((settlement, index) => (
                <div key={index} className="bg-[#0c231c] rounded border border-[#ffd700]/10">
                  <div className="p-3 border-b border-[#ffd700]/10">
                    <span className="font-medium text-red-400">{settlement.from}</span>
                    {' משלם ל'}
                    <span className="font-medium text-emerald-400">{settlement.to}</span>
                    {' סה״כ '}
                    <span className="font-medium text-[#ffd700]">₪{settlement.amount}</span>
                  </div>
                  <div className="p-3 space-y-1 text-sm">
                    {settlement.breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-300">
                        <span>{getBreakdownText(item.reason)}</span>
                        <span>₪{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
