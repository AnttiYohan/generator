<?php

function tableview($table)
{
    $html =
    '<div class="table-card">
      <div class="title">
        <h4>' . $table->title() . '</h4>
      </div>
      <table id="field-list" class="table-view">
        <thead id="thead-fields">
          <tr class="row">
            <th>key</th>
            <th>type</th>
            <th>constraint</th>
            <th class="btn-col"><button class="btn-create">new</button></th>
          </tr>
        </thead>
        <tbody id="tbody-fields">';

    foreach ($table->field_list as $field)
    {
        $html .= 
        '<tr class="row">
          <td>' . $field->title() .   '</td>
          <td>' . $field->type() .    '</td>
          <td>' . $field->cn_list() . '</td>
          <td class="btn-col"><button class="btn-delete">x</button></td>
        </tr>';
    }

    $html .=
       '</tbody> 
      </table>
      <table id="constraint-list" class="table-view">
        <caption>Constraints:</caption>
        <thead id="thead-constraints">
          <tr class="row">
            <th>constraint</th>
            <th>target</th>
            <th>rules</th>
            <th class="btn-col"><button class="btn-create">new</button></th>
          </tr>
        </thead>
        <tbody id="tbody-constraints">';

    foreach ($table->cn_list as $cn)
    {
        $html .=  
         '<tr class="row">
            <td>' . $cn->title() .  '</td>
            <td>' . $cn->target() . '</td>
            <td>' . ' ' . '</td>
            <td class="btn-col"><button class="btn-delete">x</button></td>
          </tr>';
    }

    $html .= 
        '</tbody>
      </table>
    </div>';

    return $html;
}


function read_tables()
{
    include_once "DBManager.php";
    $db  = new DBManager();  

    $sql = "SELECT * FROM Users";

    $res = $db->query($sql);

    print_r($res);
}

