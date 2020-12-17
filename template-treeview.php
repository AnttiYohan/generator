<?php

function treeview($api)
{
    $html =
    '<div id="tree-title">
      <h4>' . $api->title() . '</h4>
    </div>
    <ul id="table-root" class="tree-list">';

    foreach ($api->table_list as $table)
    {
        $html .=
        '<li class="tree-item">
          <p>' . $table->title() . '</p>
        </li>';        
    }

    $html .= 
      '</ul>';

    return $html;
}

class TreeView
{
    const STATE_NEW   = "new";
    const STATE_API   = "api";
    const STATE_TABLE = "table";

    protected $current_api = null;
    protected $table_list  = [];
    protected $state       = self::STATE_API;
    protected $title       = "";
    protected $list        = [];

    public function __construct($title, $list = [])
    {
        if ($_SESSION["treeview-state"] === self::STATE_API)
        {
          $this->state = self::STATE_API;
        }
        elseif ($_SESSION["treeview-state"] === self::STATE_TABLE)
        {
          $this->state = self::STATE_TABLE;
        }
        else
        {
            $this->state = self::STATE_NEW;
        }

        if (isset($_SESSION["current-api"]))
        {
            $this->current_api = $_SESSION["current-api"];
        }
        else
        {
            $this->current_api = 0;
        }

        $this->title = $title;

        if (is_array($list) && is_iterable($list))
        {
            $this->list = $list;
        }        
    }

    public function read_tree_data()
    {
        include_once "APIConnection.php";
        $db  = new APIConnection();  
    
        $sql = "SELECT * FROM tables WHERE api_id=" . $current_api['id']; // WHERE user_id=";
    
        $res = $db->query($sql);
    
        print_r($res);        
    }

    protected function render_api_tree($user)
    {
      $html =
      '<div id="tree-title">
        <h4>' . $api->title() . '</h4>
      </div>
      <ul id="api-list" class="tree-list">';
  
      foreach ($user->api_list as $table)
      {
          $html .=
          '<li class="tree-item">
            <p>' . $table->title() . '</p>
          </li>';        
      }
  
      $html .= 
        '</ul>';
  
      return $html;
    }

    protected function render_table_tree($api)
    {
      $html =
      '<div id="tree-title">
        <h4>' . $api->title() . '</h4>
      </div>
      <ul id="table-list" class="tree-list">';
  
      foreach ($api->table_list as $table)
      {
          $html .=
          '<li class="tree-item">
            <p>' . $table->title() . '</p>
          </li>';        
      }
  
      $html .= 
        '</ul>';
  
      return $html;
    }

    public function render($data)
    {
        $html = "";

        if ($this->state === self::STATE_API)
        {
            $html = $this->render_api_tree($data);
        }
        elseif ($this->state === self::STATE_TABLE)
        {
            $html = $this->render_table_tree($data);
        }

        return $html;
    }

    public function render_list()
    {
        $html =
        '<div id="tree-title" class="title-tool-tool-hbox"><h4>' . $this->title . 
        '</h4><button class="tool-item">ok</button><div id="new-api" class="tool-item">+</div>
        </div><ul id="tree-root" class="tree-list">';
    /*
        foreach ($this->list as $item)
        {
            $html .= '<li class="tree-item"><p>' . $item . '</p></li>';        
        }
    */
        $html .= '</ul>';
    
        return $html;
    }    
}