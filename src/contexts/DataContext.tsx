import React, { createContext, useContext, useState, useEffect } from 'react'

// Types
export interface User {
  id: string
  name: string
  email: string
  role: 'proprietaire' | 'gestionnaire' | 'locataire'
  phone?: string
  created_at: string
}

export interface Property {
  id: string
  address: string
  city: string
  postal_code: string
  type: string
  price: number
  deposit: number
  surface: number
  rooms: number
  description: string
  status: 'occupe' | 'inoccupe'
  tenant_id?: string
  created_at: string
}

export interface Contract {
  id: string
  tenant_id: string
  property_id: string
  start_date: string
  end_date?: string
  rent: number
  deposit: number
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  type: 'text' | 'file' | 'image'
  created_at: string
  read: boolean
}

export interface Payment {
  id: string
  tenant_id: string
  property_id: string
  amount: number
  date: string
  status: 'paid' | 'pending' | 'late'
  type: 'rent' | 'deposit' | 'charges'
}

interface DataContextType {
  users: User[]
  properties: Property[]
  contracts: Contract[]
  messages: Message[]
  payments: Payment[]
  addUser: (user: Omit<User, 'id' | 'created_at'>) => User
  addProperty: (property: Omit<Property, 'id' | 'status' | 'created_at'>) => Property
  addContract: (contract: Omit<Contract, 'id' | 'created_at'>) => Contract
  addMessage: (message: Omit<Message, 'id' | 'created_at'>) => Message
  updateProperty: (id: string, updates: Partial<Property>) => void
  getPropertyByTenant: (tenantId: string) => Property | undefined
  getContractByTenant: (tenantId: string) => Contract | undefined
  getMessagesBetween: (userId1: string, userId2: string) => Message[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Initial mock data
const initialUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Propriétaire Admin',
    email: 'admin@mhimmo.com',
    role: 'proprietaire',
    phone: '06 12 34 56 78',
    created_at: new Date().toISOString()
  },
  {
    id: 'manager-1',
    name: 'Marie Dubois',
    email: 'marie.dubois@mhimmo.com',
    role: 'gestionnaire',
    phone: '06 23 45 67 89',
    created_at: new Date().toISOString()
  },
  {
    id: 'tenant-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    role: 'locataire',
    phone: '06 34 56 78 90',
    created_at: new Date().toISOString()
  },
  {
    id: 'tenant-2',
    name: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    role: 'locataire',
    phone: '06 45 67 89 01',
    created_at: new Date().toISOString()
  }
]

const initialProperties: Property[] = [
  {
    id: 'prop-1',
    address: '123 Rue de la Paix',
    city: 'Paris',
    postal_code: '75001',
    type: 'appartement',
    price: 1200,
    deposit: 2400,
    surface: 65,
    rooms: 3,
    description: 'Bel appartement lumineux au cœur de Paris, proche des transports.',
    status: 'occupe',
    tenant_id: 'tenant-1',
    created_at: new Date().toISOString()
  },
  {
    id: 'prop-2',
    address: '45 Avenue des Champs',
    city: 'Lyon',
    postal_code: '69001',
    type: 'studio',
    price: 750,
    deposit: 1500,
    surface: 30,
    rooms: 1,
    description: 'Studio moderne et fonctionnel, idéal pour étudiant ou jeune actif.',
    status: 'occupe',
    tenant_id: 'tenant-2',
    created_at: new Date().toISOString()
  },
  {
    id: 'prop-3',
    address: '78 Rue du Commerce',
    city: 'Marseille',
    postal_code: '13001',
    type: 'appartement',
    price: 950,
    deposit: 1900,
    surface: 50,
    rooms: 2,
    description: 'Appartement rénové avec terrasse, quartier dynamique.',
    status: 'inoccupe',
    created_at: new Date().toISOString()
  }
]

const initialContracts: Contract[] = [
  {
    id: 'contract-1',
    tenant_id: 'tenant-1',
    property_id: 'prop-1',
    start_date: '2024-01-01',
    rent: 1200,
    deposit: 2400,
    created_at: new Date().toISOString()
  },
  {
    id: 'contract-2',
    tenant_id: 'tenant-2',
    property_id: 'prop-2',
    start_date: '2024-02-01',
    end_date: '2025-02-01',
    rent: 750,
    deposit: 1500,
    created_at: new Date().toISOString()
  }
]

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'tenant-1',
    recipient_id: 'manager-1',
    content: 'Bonjour, j\'ai un problème avec le chauffage dans mon appartement.',
    type: 'text',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    read: true
  },
  {
    id: 'msg-2',
    sender_id: 'manager-1',
    recipient_id: 'tenant-1',
    content: 'Bonjour Jean, je vais contacter un technicien pour intervenir rapidement.',
    type: 'text',
    created_at: new Date(Date.now() - 82800000).toISOString(),
    read: true
  },
  {
    id: 'msg-3',
    sender_id: 'admin-1',
    recipient_id: 'manager-1',
    content: 'Rapport mensuel disponible pour consultation.',
    type: 'text',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
]

const initialPayments: Payment[] = [
  {
    id: 'pay-1',
    tenant_id: 'tenant-1',
    property_id: 'prop-1',
    amount: 1200,
    date: '2024-03-01',
    status: 'paid',
    type: 'rent'
  },
  {
    id: 'pay-2',
    tenant_id: 'tenant-2',
    property_id: 'prop-2',
    amount: 750,
    date: '2024-03-01',
    status: 'paid',
    type: 'rent'
  },
  {
    id: 'pay-3',
    tenant_id: 'tenant-1',
    property_id: 'prop-1',
    amount: 1200,
    date: '2024-04-01',
    status: 'pending',
    type: 'rent'
  }
]

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('mhimmo-users')
    const savedProperties = localStorage.getItem('mhimmo-properties')
    const savedContracts = localStorage.getItem('mhimmo-contracts')
    const savedMessages = localStorage.getItem('mhimmo-messages')
    const savedPayments = localStorage.getItem('mhimmo-payments')

    setUsers(savedUsers ? JSON.parse(savedUsers) : initialUsers)
    setProperties(savedProperties ? JSON.parse(savedProperties) : initialProperties)
    setContracts(savedContracts ? JSON.parse(savedContracts) : initialContracts)
    setMessages(savedMessages ? JSON.parse(savedMessages) : initialMessages)
    setPayments(savedPayments ? JSON.parse(savedPayments) : initialPayments)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('mhimmo-users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('mhimmo-properties', JSON.stringify(properties))
  }, [properties])

  useEffect(() => {
    localStorage.setItem('mhimmo-contracts', JSON.stringify(contracts))
  }, [contracts])

  useEffect(() => {
    localStorage.setItem('mhimmo-messages', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem('mhimmo-payments', JSON.stringify(payments))
  }, [payments])

  const addUser = (userData: Omit<User, 'id' | 'created_at'>): User => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      created_at: new Date().toISOString()
    }
    setUsers(prev => [...prev, newUser])
    return newUser
  }

  const addProperty = (propertyData: Omit<Property, 'id' | 'status' | 'created_at'>): Property => {
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      ...propertyData,
      status: 'inoccupe',
      created_at: new Date().toISOString()
    }
    setProperties(prev => [...prev, newProperty])
    return newProperty
  }

  const addContract = (contractData: Omit<Contract, 'id' | 'created_at'>): Contract => {
    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      ...contractData,
      created_at: new Date().toISOString()
    }
    setContracts(prev => [...prev, newContract])
    
    // Update property status
    setProperties(prev => prev.map(prop => 
      prop.id === contractData.property_id 
        ? { ...prop, status: 'occupe', tenant_id: contractData.tenant_id }
        : prop
    ))
    
    return newContract
  }

  const addMessage = (messageData: Omit<Message, 'id' | 'created_at'>): Message => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      ...messageData,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(prop => 
      prop.id === id ? { ...prop, ...updates } : prop
    ))
  }

  const getPropertyByTenant = (tenantId: string): Property | undefined => {
    return properties.find(prop => prop.tenant_id === tenantId)
  }

  const getContractByTenant = (tenantId: string): Contract | undefined => {
    return contracts.find(contract => contract.tenant_id === tenantId)
  }

  const getMessagesBetween = (userId1: string, userId2: string): Message[] => {
    return messages
      .filter(msg => 
        (msg.sender_id === userId1 && msg.recipient_id === userId2) ||
        (msg.sender_id === userId2 && msg.recipient_id === userId1)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  return (
    <DataContext.Provider value={{
      users,
      properties,
      contracts,
      messages,
      payments,
      addUser,
      addProperty,
      addContract,
      addMessage,
      updateProperty,
      getPropertyByTenant,
      getContractByTenant,
      getMessagesBetween
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}