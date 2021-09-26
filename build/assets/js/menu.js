const icon=document.querySelector('.menu__icon');
if(icon){
	const menu=document.querySelector('.menu__nav');
	icon.addEventListener("click", function(e){
		menu.classList.toggle('_active');
	})
}
