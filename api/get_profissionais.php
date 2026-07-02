<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

try {
    include 'conexao.php'; 

    // Usando INNER JOIN para trazer o nome do cargo em texto que o JavaScript usa no filtro!
    $sql = "SELECT 
                p.id_profissional, 
                p.nome_profissional, 
                c.nome_cargo AS cargo 
            FROM tb_profissionais p
            INNER JOIN tb_cargos c ON p.id_cargo = c.id_cargo
            ORDER BY p.nome_profissional ASC";
            
    $query = $conexao->query($sql);
    $profissionais = $query->fetchAll(PDO::FETCH_ASSOC);

    ob_clean();
    echo json_encode($profissionais);

} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
}