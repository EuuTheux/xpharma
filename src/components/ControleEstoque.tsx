import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Plus, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Medicamento {
  id: string;
  codigo: string;
  nome: string;
  principio_ativo: string;
  concentracao: string;
  forma_farmaceutica: string;
  apresentacao: string;
}

interface Estoque {
  id: string;
  medicamento_id: string;
  quantidade_atual: number;
  quantidade_minima: number;
  lote: string;
  data_validade: string;
  data_entrada: string;
  medicamentos_2025_11_03_03_00?: Medicamento;
}

const ControleEstoque: React.FC = () => {
  const [estoque, setEstoque] = useState<Estoque[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [novaEntrada, setNovaEntrada] = useState({
    medicamento_id: '',
    quantidade: '',
    lote: '',
    data_validade: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar estoque com informações dos medicamentos
      const { data: estoqueData } = await supabase
        .from('estoque_2025_11_03_03_00')
        .select(`
          *,
          medicamentos_2025_11_03_03_00(*)
        `)
        .order('quantidade_atual', { ascending: true });

      // Carregar medicamentos para o select
      const { data: medicamentosData } = await supabase
        .from('medicamentos_2025_11_03_03_00')
        .select('*')
        .order('nome');

      setEstoque(estoqueData || []);
      setMedicamentos(medicamentosData || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarEstoque = async () => {
    if (!novaEntrada.medicamento_id || !novaEntrada.quantidade || !novaEntrada.lote || !novaEntrada.data_validade) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verificar se já existe estoque para este medicamento
      const estoqueExistente = estoque.find(e => e.medicamento_id === novaEntrada.medicamento_id);
      
      if (estoqueExistente) {
        // Atualizar estoque existente
        const { error } = await supabase
          .from('estoque_2025_11_03_03_00')
          .update({
            quantidade_atual: estoqueExistente.quantidade_atual + parseInt(novaEntrada.quantidade),
            updated_at: new Date().toISOString()
          })
          .eq('id', estoqueExistente.id);

        if (error) throw error;
      } else {
        // Criar novo registro de estoque
        const { error } = await supabase
          .from('estoque_2025_11_03_03_00')
          .insert([{
            medicamento_id: novaEntrada.medicamento_id,
            quantidade_atual: parseInt(novaEntrada.quantidade),
            quantidade_minima: 10,
            lote: novaEntrada.lote,
            data_validade: novaEntrada.data_validade,
            data_entrada: new Date().toISOString().split('T')[0]
          }]);

        if (error) throw error;
      }

      setNovaEntrada({
        medicamento_id: '',
        quantidade: '',
        lote: '',
        data_validade: ''
      });
      setDialogOpen(false);
      carregarDados();

      toast({
        title: "Sucesso",
        description: "Estoque atualizado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque",
        variant: "destructive"
      });
    }
  };

  const estoquesFiltrados = estoque.filter(item => {
    const medicamento = item.medicamentos_2025_11_03_03_00;
    if (!medicamento) return false;
    
    const termo = searchTerm.toLowerCase();
    return (
      medicamento.nome.toLowerCase().includes(termo) ||
      medicamento.codigo.toLowerCase().includes(termo) ||
      medicamento.principio_ativo.toLowerCase().includes(termo)
    );
  });

  const getStatusBadge = (quantidade: number, minima: number) => {
    if (quantidade === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (quantidade <= minima) {
      return <Badge variant="secondary">Estoque Baixo</Badge>;
    } else {
      return <Badge variant="default">Normal</Badge>;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Controle de Estoque</h2>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Estoque
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar ao Estoque</DialogTitle>
              <DialogDescription>
                Adicione medicamentos ao estoque ou atualize quantidades existentes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="medicamento">Medicamento *</Label>
                <select
                  id="medicamento"
                  className="w-full p-2 border rounded-md"
                  value={novaEntrada.medicamento_id}
                  onChange={(e) => setNovaEntrada({ ...novaEntrada, medicamento_id: e.target.value })}
                >
                  <option value="">Selecione um medicamento</option>
                  {medicamentos.map(med => (
                    <option key={med.id} value={med.id}>
                      {med.codigo} - {med.nome} - {med.concentracao}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={novaEntrada.quantidade}
                  onChange={(e) => setNovaEntrada({ ...novaEntrada, quantidade: e.target.value })}
                  placeholder="Quantidade a adicionar"
                />
              </div>
              
              <div>
                <Label htmlFor="lote">Lote *</Label>
                <Input
                  id="lote"
                  value={novaEntrada.lote}
                  onChange={(e) => setNovaEntrada({ ...novaEntrada, lote: e.target.value })}
                  placeholder="Número do lote"
                />
              </div>
              
              <div>
                <Label htmlFor="data_validade">Data de Validade *</Label>
                <Input
                  id="data_validade"
                  type="date"
                  value={novaEntrada.data_validade}
                  onChange={(e) => setNovaEntrada({ ...novaEntrada, data_validade: e.target.value })}
                />
              </div>
              
              <Button onClick={adicionarEstoque} className="w-full">
                Adicionar ao Estoque
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicamentos em Estoque</CardTitle>
          <CardDescription>
            Visualize e gerencie o estoque de medicamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar medicamento por nome, código ou princípio ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Princípio Ativo</TableHead>
                  <TableHead>Concentração</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoquesFiltrados.map((item) => {
                  const medicamento = item.medicamentos_2025_11_03_03_00;
                  if (!medicamento) return null;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{medicamento.codigo}</TableCell>
                      <TableCell>{medicamento.nome}</TableCell>
                      <TableCell>{medicamento.principio_ativo}</TableCell>
                      <TableCell>{medicamento.concentracao}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{item.quantidade_atual}</span>
                          {item.quantidade_atual <= item.quantidade_minima && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.quantidade_atual, item.quantidade_minima)}
                      </TableCell>
                      <TableCell>{item.lote}</TableCell>
                      <TableCell>{formatarData(item.data_validade)}</TableCell>
                    </TableRow>
                  );
                })}
                {estoquesFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum medicamento encontrado no estoque
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControleEstoque;