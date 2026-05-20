import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import TabBar from '../../components/TabBar'
import PetAvatar from '../../components/PetAvatar'
import { useStore } from '../../data/store'
import { ChevronRight, PawPrint } from 'lucide-react'

export default function CaretakerHistory() {
  const navigate = useNavigate()
  const { orders, pets } = useStore()
  const completed = orders.filter((o) => o.status === 'completed')

  const getPetType = (order) => {
    const pet = pets.find(p => p.id === order.petId)
    return pet ? pet.type : 'cat'
  }

  return (
    <>
      <Layout title="服务记录">
        <div className="px-4 py-4">
          {completed.length === 0 ? (
            <div className="shop-card text-center text-text-tertiary py-10 text-sm flex flex-col items-center gap-2">
              <PawPrint size={28} className="text-text-tertiary" />
              还没有服务记录，接单后这里会显示
            </div>
          ) : (
            <div className="shop-card divide-y divide-border overflow-hidden">
            {completed.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/caretaker/order/${order.id}`)}
                className="w-full p-4 flex items-center gap-3 text-left active:opacity-60 transition-opacity cursor-pointer"
              >
                <PetAvatar type={getPetType(order)} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{order.petName}</span>
                    <span className="text-sm font-bold text-text">+¥{order.price}</span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-0.5">{order.scheduledAt} · {order.address.slice(0, 12)}...</div>
                </div>
                <ChevronRight size={14} className="text-text-tertiary" />
              </button>
            ))}
            </div>
          )}
        </div>
      </Layout>
      <TabBar />
    </>
  )
}
