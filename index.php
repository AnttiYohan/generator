<?php
session_start();
$_SESSION["user"] = "apiguest";
$_SESSION["treeview-state"] = "api";



?>
<!DOCTYPE html>
<html>
  <head>
	<link rel="icon" href="data:;base64,iVBORxOKGO=">
    <link rel="stylesheet" href="css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Ubuntu+Mono&display=swap" rel="stylesheet">
    <!-- script defer src="./wc/TreeView.js" type="module"></script -->
    <!--script defer src="./wc/ToolBar.js" type="module"></script>
    <script defer src="./wc/ToolItem.js" type="module"></script -->
  </head>
  <body style="background:#e8d8f8;">
    <header>
      <h1>APIGEN</h1>
        <!-- tool-bar>
          <tool-item c="#e1e1f8" bg="#212128">t1</tool-item>
          <tool-item c="#e1e1f8" bg="#212128">t2</tool-item>
          <tool-item c="#e1e1f8" bg="#212128">t3</tool-item>                    
        </tool-bar -->    
      <!--<div class="toolbar">
        <div class="tool-item">t1</div>
        <div class="tool-item">t2</div>
        <tool-item c="#ff9" bg="#112">t3</tool-item>
      </div -->
    </header>
    <main id="main-content">
    </main>
  </body>
</html>
<script src="./js/apieditor.js" type="module"></script>