<?php
ob_start(); 
header('Content-Type: application/json; charset=utf-8');

try {
    include 'conexao.php'; 

    $dados = json_decode(file_get_contents('php://input'), true);

    if (!$dados) {
        throw new Exception('Nenhum dado foi recebido pelo servidor.');
    }

    $dataAtendimento   = $dados['data_atendimento'] ?? '';
    $idProfissional    = $dados['id_profissional'] ?? '';
    $idTipoAtendimento = $dados['id_tipo_atendimento'] ?? '';
    $quantidade        = $dados['quantidade'] ?? 0;
    $statusAtendimento = $dados['status_atendimento'] ?? 'Realizado'; 

    if (empty($dataAtendimento) || empty($idProfissional) || empty($idTipoAtendimento) || empty($quantidade) || empty($statusAtendimento)) {
        throw new Exception('Por favor, preencha todos os campos obrigatórios.');
    }

    $sql = "INSERT INTO tb_producao (data_atendimento, id_profissional, id_tipo_atendimento, quantidade, status_atendimento) 
            VALUES (:data_atendimento, :id_profissional, :id_tipo_atendimento, :quantidade, :status_atendimento)";
            
    $query = $conexao->prepare($sql);
    
    $query->execute([
        ':data_atendimento'    => $dataAtendimento,
        ':id_profissional'     => $idProfissional,
        ':id_tipo_atendimento' => $idTipoAtendimento,
        ':quantidade'          => $quantidade,
        ':status_atendimento'  => $statusAtendimento
    ]);

    ob_clean(); 
    echo json_encode(['sucesso' => true, 'mensagem' => 'Produção lançada com sucesso, mano!']);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro no servidor: ' . $e->getMessage()]);
}