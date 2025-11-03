import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Package, Users, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalMedicamentos: number;
  totalPacientes: number;
  dispensacoesHoje: number;
  dispensacoesMes: number;
  medicamentosEstoqueBaixo: number;
  medicamentosSemEstoque: number;
}

interface RecentDispensacao {
  id: string;
  data_dispensacao: string;
  quantidade_dispensada: number;
  pacientes_2025_11_03_03_00: {
    nome: string;
  };
  medicamentos_2025_11_03_03_00: {
    nome: string;
    codigo: string;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMedicamentos: 0,
    totalPacientes: 0,
    dispensacoesHoje: 0,
    dispensacoesMes: 0,
    medicamentosEstoqueBaixo: 0,
    medicamentosSemEstoque: 0
  });
  const [recentDispensacoes, setRecentDispensacoes] = useState<RecentDispensacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas
      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Total de medicamentos
      const { count: totalMedicamentos } = await supabase
        .from('medicamentos_2025_11_03_03_00')
        .select('*', { count: 'exact', head: true });

      // Total de pacientes
      const { count: totalPacientes } = await supabase
        .from('pacientes_2025_11_03_03_00')
        .select('*', { count: 'exact', head: true });

      // Dispensações hoje
      const { count: dispensacoesHoje } = await supabase
        .from('dispensacoes_2025_11_03_03_00')
        .select('*', { count: 'exact', head: true })
        .gte('data_dispensacao', hoje);

      // Dispensações do mês
      const { count: dispensacoesMes } = await supabase
        .from('dispensacoes_2025_11_03_03_00')
        .select('*', { count: 'exact', head: true })
        .gte('data_dispensacao', inicioMes);

      // Estoque baixo e sem estoque
      const { data: estoqueData } = await supabase
        .from('estoque_2025_11_03_03_00')
        .select('quantidade_atual, quantidade_minima');

      const medicamentosEstoqueBaixo = estoqueData?.filter(e => 
        e.quantidade_atual > 0 && e.quantidade_atual <= e.quantidade_minima
      ).length || 0;

      const medicamentosSemEstoque = estoqueData?.filter(e => 
        e.quantidade_atual === 0
      ).length || 0;

      setStats({
        totalMedicamentos: totalMedicamentos || 0,
        totalPacientes: totalPacientes || 0,
        dispensacoesHoje: dispensacoesHoje || 0,
        dispensacoesMes: dispensacoesMes || 0,
        medicamentosEstoqueBaixo,
        medicamentosSemEstoque
      });

      // Carregar dispensações recentes
      const { data: dispensacoesRecentes } = await supabase
        .from('dispensacoes_2025_11_03_03_00')
        .select(`
          *,
          pacientes_2025_11_03_03_00(nome),
          medicamentos_2025_11_03_03_00(nome, codigo)
        `)
        .order('data_dispensacao', { ascending: false })
        .limit(5);

      setRecentDispensacoes(dispensacoesRecentes || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
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
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Medicamentos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicamentos}</div>
            <p className="text-xs text-muted-foreground">
              Medicamentos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPacientes}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensações Hoje</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dispensacoesHoje}</div>
            <p className="text-xs text-muted-foreground">
              Medicamentos dispensados hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensações do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dispensacoesMes}</div>
            <p className="text-xs text-muted-foreground">
              Total de dispensações este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.medicamentosEstoqueBaixo}</div>
            <p className="text-xs text-muted-foreground">
              Medicamentos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.medicamentosSemEstoque}</div>
            <p className="text-xs text-muted-foreground">
              Medicamentos sem estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dispensações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Dispensações Recentes</CardTitle>
          <CardDescription>
            Últimas 5 dispensações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDispensacoes.map((dispensacao) => (
              <div key={dispensacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {dispensacao.pacientes_2025_11_03_03_00?.nome}
                    </span>
                    <Badge variant="outline">
                      {dispensacao.medicamentos_2025_11_03_03_00?.codigo}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {dispensacao.medicamentos_2025_11_03_03_00?.nome}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Qtd: {dispensacao.quantidade_dispensada}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatarData(dispensacao.data_dispensacao)}
                  </div>
                </div>
              </div>
            ))}
            {recentDispensacoes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma dispensação realizada ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;