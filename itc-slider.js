/*
 * <div class="carousel"> width: 100% (от контейнера .container 900px)
 *     <div class="carousel-window"> width: 100% (от родителя 900px); height: 500px
 *         <div class="carousel-slides"> display: flex, style.width = 300% (2700px)
 *             <div class="carousel-item">...</div> style.width = 33.33333% (900px)
 *             <div class="carousel-item">...</div> style.width = 33.33333% (900px)
 *             <div class="carousel-item">...</div> style.width = 33.33333% (900px)
 *         </div>
 *     </div>
 * </div>
 */

class Slider {
  constructor(slider, {autoplay = true, inFrame = 1, offset = 1} = {}) {
      // элемент div.carousel
      this.slider = slider;
      // кол-во элементов в одном кадре
      this.inFrame = inFrame;
      // на сколько элементов смещать
      this.offset = offset;

      // все элементы слайдера
      this.allItems = slider.querySelectorAll('.carousel-item');
      // сколько всего элементов
      this.itemCount = this.allItems.length;

      // все кадры слайдера
      this.allFrames = this.frames();
      // сколько всего кадров
      this.frameCount = this.allFrames.length;
      // индекс кадра в окне просмотра
      this.frameIndex = 0;

      // контейнер для элементов
      this.wrapper = slider.querySelector('.carousel-slides');
      // кнопка «вперед»
      this.nextButton = slider.querySelector('.carousel-next');
      // кнопка «назад»
      this.prevButton = slider.querySelector('.carousel-prev');

      this.autoplay = autoplay; // включить автоматическую прокрутку?
      this.paused = null; // чтобы можно было выключать автопрокрутку

      this.init(); // инициализация слайдера
  }

  init() {
      this.dotButtons = this.dots(); // создать индикатор текущего кадра

      // если всего 10 элементов, то ширина одного элемента составляет 1/10
      // ширины контейнера .carousel-slides, то есть 100/10 = 10%
      this.allItems.forEach(item => item.style.width = 100 / this.itemCount + '%');
      // ширина контейнера должна вмещать все элементы: если элементов 10,
      // в окне просмотра 3 элемента, тогда ширина контейнера равна ширине
      // трех окон просмотра (300%) плюс ширина одного элемента 33.33333%,
      let wrapperWidth = this.itemCount / this.inFrame * 100;
      this.wrapper.style.width = wrapperWidth + '%';

      this.nextButton.addEventListener('click', event => { // клик по кнопке «вперед»
          event.preventDefault();
          this.next();
      });

      this.prevButton.addEventListener('click', event => { // клик по кнопке «назад»
          event.preventDefault();
          this.prev();
      });

      // клики по кнопкам индикатора текущего кадра
      this.dotButtons.forEach(dot => {
          dot.addEventListener('click', event => {
              event.preventDefault();
              const frameIndex = this.dotButtons.indexOf(event.target);
              if (frameIndex === this.frameIndex) return;
              this.goto(frameIndex);
          });
      });

      if (this.autoplay) { // включить автоматическую прокрутку?
          this.play();
          // когда мышь над слайдером — останавливаем автоматическую прокрутку
          this.slider.addEventListener('mouseenter', () => clearInterval(this.paused));
          // когда мышь покидает пределы слайдера — опять запускаем прокрутку
          this.slider.addEventListener('mouseleave', () => this.play());
      }
  }

  // перейти к кадру с индексом index
  goto(index) {
      if (index > this.frameCount - 1) {
          this.frameIndex = 0;
      } else if (index < 0) {
          this.frameIndex = this.frameCount - 1;
      } else {
          this.frameIndex = index;
      }
      // ...и выполнить смещение
      this.move();
  }

  // перейти к следующему кадру
  next() {
      this.goto(this.frameIndex + 1);
  }

  // перейти к предыдущему кадру
  prev() {
      this.goto(this.frameIndex - 1);
  }

  // рассчитать и выполнить смещение
  move() {
      // на сколько нужно сместить, чтобы нужный кадр попал в окно
      const offset = 100 / this.itemCount * this.allFrames[this.frameIndex];
      this.wrapper.style.transform = `translateX(-${offset}%)`;
      this.dotButtons.forEach(dot => dot.classList.remove('active'));
      this.dotButtons[this.frameIndex].classList.add('active');
  }

  // запустить автоматическую прокрутку
  play() {
      this.paused = setInterval(() => this.next(), 3000);
  }

  // создать индикатор текущего кадра
  dots() {
      const ol = document.createElement('ol');
      ol.classList.add('carousel-indicators');
      const children = [];
      for (let i = 0; i < this.frameCount; i++) {
          let li = document.createElement('li');
          if (i === 0) li.classList.add('active');
          ol.append(li);
          children.push(li);
      }
      this.slider.prepend(ol);
      return children;
  }

  // индекс первого элемента каждого кадра
  frames() {
      // все наборы элементов, которые потенциально могут быть кадрами
      let temp = [];
      for (let i = 0; i < this.itemCount; i++) {
          // этот набор из this.inFrame элементов без пустого места
          if (this.allItems[i + this.inFrame - 1] !== undefined) {
              temp.push(i);
          }
      }
      // с учетом того, что смещение this.offset может быть больше 1,
      // реальных кадров будет меньше или столько же
      let allFrames = [];
      for (let i = 0; i < temp.length; i = i + this.offset) {
          allFrames.push(temp[i]);
      }
      // в конце могут быть элементы, которые не могут образовать целый кадр (без пустоты),
      // такой кадр вообще не попадает в окно просмотра; вместо него показываем последний
      // целый кадр из числа потенциальных; при этом смещение будет меньше this.offset
      if (allFrames[allFrames.length - 1] !== temp[temp.length - 1]) {
          allFrames.push(temp[temp.length - 1]);
      }
      return allFrames;
  }
}