<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Demo - Web Worker Manager</title>
    <script type="text/javascript" src="assets/js/jquery-1.12.js"></script>
    <script type="text/javascript" src="worker_manager.js"></script>
    <link rel="stylesheet" type="text/css" href="demo.css">
    <script type="text/javascript" src="demo.js"></script>
</head>
<body>
    <div class='form-container'>
        Number of loops: 
        <input type='text' name='loops' value='100000' />
    </div>
    <div class='container'>
        <div class='main-column'>
            <button name='jsonly' onclick="runTest('jsonly')">JavaScript Only</button>
            <div id='jsonly-response' class='response'></div>
        </div>
        <div class='display-column'>
            <div class='image-container'>
                <img src='assets/images/noname.jpg'/>
            </div>
        </div>
    </div>
    
    <div class='container'>
        <div class='main-column'>
            <button name='worker' onclick="runTest('worker')">Web Worker</button>
            <div id='worker-response' class='response'></div>
        </div>
        <div class='display-column'>
            <div class='image-container'>
                <img src='assets/images/wizard.jpg'/>
            </div>
        </div>
    </div>
</body>
</html>