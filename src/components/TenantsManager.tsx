import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Euro,
  Edit,
  Eye,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export const TenantsManager: React.FC = () => {
  const { user } = useAuth()
  const { users, properties, contracts, addUser, addContract, getPropertyByTenant, getContractByTenant } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showContractDialog, setShowContractDialog] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)

  // Form state for new tenant
  const [tenantForm, setTenantForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'locataire123'
  })

  // Form state for contract
  const [contractForm, setContractForm] = useState({
    tenant_id: '',
    property_id: '',
    start_date: '',
    end_date: '',
    rent: '',
    deposit: ''
  })

  // Get tenants with enriched data
  const tenants = users
    .filter(u => u.role === 'locataire')
    .map(tenant => {
      const property = getPropertyByTenant(tenant.id)
      const contract = getContractByTenant(tenant.id)
      return {
        ...tenant,
        property,
        contract
      }
    })

  // Available properties (not occupied)
  const availableProperties = properties.filter(p => p.status === 'inoccupe')

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      addUser({
        name: tenantForm.name,
        email: tenantForm.email,
        phone: tenantForm.phone,
        role: 'locataire'
      })
      
      toast.success('Locataire créé avec succès')
      setShowAddDialog(false)
      resetTenantForm()
    } catch (error) {
      console.error('Error creating tenant:', error)
      toast.error('Erreur lors de la création du locataire')
    }
  }

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      addContract({
        tenant_id: contractForm.tenant_id,
        property_id: contractForm.property_id,
        start_date: contractForm.start_date,
        end_date: contractForm.end_date || undefined,
        rent: parseFloat(contractForm.rent),
        deposit: parseFloat(contractForm.deposit)
      })
      
      toast.success('Contrat créé avec succès')
      setShowContractDialog(false)
      resetContractForm()
    } catch (error) {
      console.error('Error creating contract:', error)
      toast.error('Erreur lors de la création du contrat')
    }
  }

  const resetTenantForm = () => {
    setTenantForm({
      name: '',
      email: '',
      phone: '',
      password: 'locataire123'
    })
  }

  const resetContractForm = () => {
    setContractForm({
      tenant_id: '',
      property_id: '',
      start_date: '',
      end_date: '',
      rent: '',
      deposit: ''
    })
    setSelectedTenant(null)
  }

  const openContractDialog = (tenant: any) => {
    setSelectedTenant(tenant)
    setContractForm(prev => ({ ...prev, tenant_id: tenant.id }))
    setShowContractDialog(true)
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (tenant: any) => {
    if (tenant.contract) {
      return <Badge variant="default">Actif</Badge>
    }
    return <Badge variant="secondary">Sans contrat</Badge>
  }

  const TenantCard = ({ tenant }: { tenant: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{tenant.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Mail className="h-4 w-4 mr-1" />
              {tenant.email}
            </CardDescription>
          </div>
          {getStatusBadge(tenant)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tenant.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">{tenant.phone}</span>
            </div>
          )}
          
          {tenant.property ? (
            <>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">{tenant.property.address}, {tenant.property.city}</span>
              </div>
              <div className="flex items-center">
                <Euro className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">{tenant.property.price.toLocaleString()}€/mois</span>
              </div>
              {tenant.contract && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    Depuis le {new Date(tenant.contract.start_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              Aucun bien assigné
            </div>
          )}
        </div>
        
        {(user?.role === 'proprietaire' || user?.role === 'gestionnaire') && (
          <div className="flex space-x-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Voir
            </Button>
            {!tenant.contract && availableProperties.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => openContractDialog(tenant)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Contrat
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl text-gray-900 dark:text-white">
            Gestion des locataires
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTenants.length} locataire(s) trouvé(s)
          </p>
        </div>
        
        {(user?.role === 'proprietaire' || user?.role === 'gestionnaire') && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un locataire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau locataire</DialogTitle>
                <DialogDescription>
                  Créer un compte locataire dans le système
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={tenantForm.email}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jean.dupont@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    value={tenantForm.phone}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="06 12 34 56 78"
                  />
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Mot de passe par défaut :</strong> locataire123
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Le locataire pourra le modifier lors de sa première connexion
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Créer le locataire
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tenants Grid */}
      {filteredTenants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-900 dark:text-white mb-2">
              Aucun locataire trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Aucun locataire ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier locataire.'
              }
            </p>
            {(user?.role === 'proprietaire' || user?.role === 'gestionnaire') && !searchTerm && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un locataire
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}

      {/* Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un contrat</DialogTitle>
            <DialogDescription>
              Assigner un bien à {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateContract} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Bien immobilier</Label>
              <Select 
                value={contractForm.property_id} 
                onValueChange={(value) => {
                  const property = availableProperties.find(p => p.id === value)
                  setContractForm(prev => ({ 
                    ...prev, 
                    property_id: value,
                    rent: property?.price.toString() || '',
                    deposit: property?.deposit.toString() || ''
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un bien" />
                </SelectTrigger>
                <SelectContent>
                  {availableProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}, {property.city} - {property.price.toLocaleString()}€/mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={contractForm.start_date}
                  onChange={(e) => setContractForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin (optionnel)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={contractForm.end_date}
                  onChange={(e) => setContractForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Loyer mensuel (€)</Label>
                <Input
                  id="rent"
                  type="number"
                  value={contractForm.rent}
                  onChange={(e) => setContractForm(prev => ({ ...prev, rent: e.target.value }))}
                  placeholder="950"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deposit">Caution (€)</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={contractForm.deposit}
                  onChange={(e) => setContractForm(prev => ({ ...prev, deposit: e.target.value }))}
                  placeholder="1900"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowContractDialog(false)} 
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                Créer le contrat
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}