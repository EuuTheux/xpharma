import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown, Calendar, Search } from 'lucide-react';

interface Dispensacao {
  id: string;
  quantidade_dispensada: number;
  data_dispensacao: string;
  observacoes: string;
  usuario_dispensacao: string;
  pacientes_2025_11_03_03_00: {
    nome: string;
    cpf: string;
  };
  medicamentos_2025_11_03_03_00: {
    nome: string;
    codigo: string;
    principio_ativo: string;
    concentracao: string;
  };
}

const RelatoriosDispensacao: React.FC = () => {
  const [dispensacoes, setDispensacoes] = useState<Dispensacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    paciente: '',
    medicamento: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    carregarDispensacoes();
  }, []);

  const carregarDispensacoes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('dispensacoes_2025_11_03_03_00')
        .select(`
          *,
          pacientes_2025_11_03_03_00(nome, cpf),
          medicamentos_2025_11_03_03_00(nome, codigo, principio_ativo, concentracao)
        `)
        .order('data_dispensacao', { ascending: false });

      if (filtros.dataInicio) {
        query = query.gte('data_dispensacao', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('data_dispensacao', filtros.dataFim + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) throw error;

      let dispensacoesFiltradas = data || [];

      // Filtros adicionais no frontend
      if (filtros.paciente) {
        dispensacoesFiltradas = dispensacoesFiltradas.filter(d =>
          d.pacientes_2025_11_03_03_00?.nome.toLowerCase().includes(filtros.paciente.toLowerCase()) ||
          d.pacientes_2025_11_03_03_00?.cpf.includes(filtros.paciente)
        );
      }

      if (filtros.medicamento) {
        dispensacoesFiltradas = dispensacoesFiltradas.filter(d =>
          d.medicamentos_2025_11_03_03_00?.nome.toLowerCase().includes(filtros.medicamento.toLowerCase()) ||
          d.medicamentos_2025_11_03_03_00?.codigo.toLowerCase().includes(filtros.medicamento.toLowerCase())
        );
      }

      setDispensacoes(dispensacoesFiltradas);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dispensações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarPlanilha = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);

      const { data, error } = await supabase.functions.invoke('exportar_dispensacoes_2025_11_03_03_00', {
        method: 'GET'
      });

      if (error) throw error;

      // Criar URL para download
      const url = `${supabase.supabaseUrl}/functions/v1/exportar_dispensacoes_2025_11_03_03_00?${params.toString()}`;
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `dispensacoes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Planilha exportada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar planilha",
        variant: "destructive"
      });
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      paciente: '',
      medicamento: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileDown className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Relatórios de Dispensação</h2>
        </div>
        
        <Button onClick={exportarPlanilha} disabled={loading}>
          <FileDown className="h-4 w-4 mr-2" />
          Exportar Planilha
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="paciente">Paciente</Label>
              <Input
                id="paciente"
                placeholder="Nome ou CPF do paciente"
                value={filtros.paciente}
                onChange={(e) => setFiltros({ ...filtros, paciente: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="medicamento">Medicamento</Label>
              <Input
                id="medicamento"
                placeholder="Nome ou código do medicamento"
                value={filtros.medicamento}
                onChange={(e) => setFiltros({ ...filtros, medicamento: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button onClick={carregarDispensacoes} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Dispensações */}
      <Card>
        <CardHeader>
          <CardTitle>Dispensações Realizadas</CardTitle>
          <CardDescription>
            Total de {dispensacoes.length} dispensação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispensacoes.map((dispensacao) => (
                  <TableRow key={dispensacao.id}>
                    <TableCell>{formatarData(dispensacao.data_dispensacao)}</TableCell>
                    <TableCell>{dispensacao.pacientes_2025_11_03_03_00?.nome}</TableCell>
                    <TableCell>{dispensacao.pacientes_2025_11_03_03_00?.cpf}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {dispensacao.medicamentos_2025_11_03_03_00?.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dispensacao.medicamentos_2025_11_03_03_00?.concentracao}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{dispensacao.medicamentos_2025_11_03_03_00?.codigo}</TableCell>
                    <TableCell>{dispensacao.quantidade_dispensada}</TableCell>
                    <TableCell>{dispensacao.usuario_dispensacao}</TableCell>
                    <TableCell>{dispensacao.observacoes || '-'}</TableCell>
                  </TableRow>
                ))}
                {dispensacoes.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhuma dispensação encontrada
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

export default RelatoriosDispensacao;