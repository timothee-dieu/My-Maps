var fullscreen = false;

$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', function()
{
	fullscreen = !fullscreen;
	if (fullscreen) {
		$('#map').width(screen.width);
		$('#map').height(screen.height);
	} else {
    	$('#map').width('800px');
		$('#map').height('600px');
    }
    console.log('fullscreen:' + fullscreen);
});


function onFullScreenClick()
{
	if (fullscreen) {
		exitFullscreen();
	}
	else
	{
		enterFullscreen($('html').get(0));
	}
	
}

function enterFullscreen(elem)
{
	if (elem.requestFullscreen) {
	  elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
	  elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
	  elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
	  elem.webkitRequestFullscreen();
	}
}

function exitFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msCancelFullScreen) {
	document.msCancelFullScreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}