import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Building2, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        toast.success('Connexion réussie')
      } else {
        toast.error('Email ou mot de passe incorrect')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role: 'proprietaire' | 'gestionnaire' | 'locataire') => {
    const credentials = {
      proprietaire: { email: 'admin@mhimmo.com', password: 'admin123' },
      gestionnaire: { email: 'marie.dubois@mhimmo.com', password: 'manager123' },
      locataire: { email: 'jean.dupont@email.com', password: 'tenant123' }
    }
    
    setEmail(credentials[role].email)
    setPassword(credentials[role].password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">mhImmo</CardTitle>
          <CardDescription>
            Gestion locative moderne et intelligente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mhimmo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Comptes de démonstration
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('proprietaire')}
                className="text-xs"
              >
                Propriétaire
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('gestionnaire')}
                className="text-xs"
              >
                Gestionnaire
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('locataire')}
                className="text-xs"
              >
                Locataire
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Identifiants de test :</strong>
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <div>
                  <strong>Propriétaire :</strong> admin@mhimmo.com / admin123
                </div>
                <div>
                  <strong>Gestionnaire :</strong> marie.dubois@mhimmo.com / manager123
                </div>
                <div>
                  <strong>Locataire :</strong> jean.dupont@email.com / tenant123
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}