$("#menu-toggle").click(function(e) 
{
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
	$('h1 span').toggleClass('animated bounce');
	$('hr').toggleClass('animated zoomIn');
});