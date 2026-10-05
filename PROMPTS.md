# Промпты для картинок упражнений (Nano Banana 2)

Картинка живёт в слоте 56×56 на карточке упражнения, поэтому главное: крупный простой силуэт, минимум деталей.

Утверждён жим лёжа v3: [art/bench-v3.png](art/bench-v3.png) (оригинал), в приложении `proto/img/bench.webp`.

## Правила серии

- Квадрат 1:1, прямые углы. Не писать «app icon»: модель сама скругляет углы.
- Строгий профиль сбоку, камера на уровне снаряда. Ракурс три четверти на 56px превращается в кашу.
- Описывать, что есть, а не чего нет. Запрет «no power rack» тянет стойку в кадр, а «скамья стоит одна в пустом пространстве» её убирает.
- Тело из 2–3 тоновых пятен, без прорисованных мышц.
- Палитра одна на всю серию. Оранжевый акцент только на блинах и мягких накладках: синий и зелёный в интерфейсе уже значат статусы.
- Зазор от края кадра до любого элемента со всех сторон. Ничего не обрезаем.

## Шаблон

```
Square 1:1 illustration, full-bleed, sharp square corners.
{СЮЖЕТ}

Style: minimal flat vector illustration, bold simple shapes, clean silhouette,
smooth body with only 2-3 soft tone shapes, no detailed muscles, no texture.
Must stay readable at 56x56 pixels.

Colors: solid uniform background #111629 edge to edge.
Figure in cool light grey #c9d3de with darker grey #3a4556 shorts and shoes.
Equipment frame and bar in graphite #2a3240 with light grey highlights.
Single accent: warm orange #ff8a3d on the weight plates and the seat or bench pads only.

Composition: the figure and equipment are large and centered,
with a clear empty margin of about 6% between every element and every edge of the image.
Nothing touches or crosses the edges.

No text, no logos, no glow, no shadows, no other gym equipment.
```

## Перерисовка реального фото

Когда модель путает упражнение (жим в тренажёре выходил бабочкой), прикладываем одно реальное фото упражнения
и перерисовываем его в стиль серии. Поза и тренажёр берутся с фото, стиль задаётся только текстом.
Модель почти не меняет ракурс, поэтому фото выбираем сразу в нужном ракурсе: человек целиком, простой фон.

```
Redraw this photo as a new flat illustration.

Keep only: the person's pose and body position, and the parts of the machine he is touching or sitting on
(seat, back pad, handles and the lever arms that hold the handles), simplified to a few clean flat shapes
on one simple base. Remove everything else: the gym, walls, floor, mirrors, other people, weight stack,
cables, logos and machine frame parts that are not needed to understand the movement.

Style: minimal flat vector illustration, bold simple shapes, clean silhouette,
smooth body with only 2-3 soft tone shapes, no detailed muscles, no face details, no texture.
Must stay readable at 56x56 pixels.

Colors: solid uniform background #111629 edge to edge.
Figure in cool light grey #c9d3de with darker grey #3a4556 shorts and shoes.
Machine frame and levers in graphite #2a3240 with light grey highlights.
Single accent: warm orange #ff8a3d on the seat and pads and the handle grips only.

Square 1:1, full-bleed, sharp square corners.
The figure and machine are large and centered, with a clear empty margin of about 6%
between every element and every edge of the image. Nothing touches or crosses the edges.

No text, no logos, no glow, no shadows, no photo textures, no realistic details.
```

Жим от груди в тренажёре сделан так: [art/chestpress.png](art/chestpress.png).

Модель любит «нормализовать» позу до стартовой: у бицепса выпрямила руки, хотя на фото они были согнуты.
Описание позы словами в том же промпте не помогло. Сработал отдельный запрос поверх уже готовой картинки:
сначала стиль, потом одной правкой поза (согнуть руки, поднять гриф к плечам).
Так сделан подъём штанги на бицепс: [art/curl.png](art/curl.png).

## Подготовка для приложения

```
python art/prep.py <картинка.png> <имя>
```

Скрипт ставит квадратный кадр с зазором 6% по содержимому, вырезает фон в прозрачность
и кладёт `proto/img/<имя>.webp`. В `EX` у упражнения ставим `cut: true`, тогда картинка без рамки и крупнее.

## Сюжеты

**Жим штанги лёжа** (утверждён)
```
Barbell bench press in a strict flat side profile view, camera at bench height.
A man lies on a simple flat bench that stands alone in empty space.
He holds a barbell straight above his chest with fully extended arms;
the barbell is supported only by his hands. Feet flat on the floor.
The barbell is thick and clearly visible, with one big, thick weight plate on each side.
```

**Тяга верхнего блока к груди**
```
Lat pulldown in a strict flat side profile view, camera at seat height.
A man sits on the machine seat with his thighs under the knee pads,
pulling a wide straight bar down to his upper chest, elbows pointing down and back.
A single cable goes straight up from the bar to a pulley at the top of a simple vertical frame.
```

**Жим от груди в тренажёре**
```
Seated chest press machine in a strict flat side profile view.
A man sits upright against a tall back pad and pushes two horizontal handles
forward at chest height, arms almost straight.
The machine is a simple frame with a short vertical weight stack behind the seat.
```

**Горизонтальная тяга узким хватом в блочном тренажёре**
```
Seated cable row in a strict flat side profile view, camera at seat height.
A man sits on a low flat seat, feet on a foot plate, knees slightly bent, torso upright,
pulling a close-grip V-handle to his stomach, elbows behind his body.
A single straight cable runs horizontally from the handle to a low pulley on a simple frame.
```

**Подъём штанги на бицепс стоя**
```
Standing barbell curl in a strict flat side profile view.
A man stands upright with elbows pinned to his sides,
holding a barbell at the middle of the curl with forearms horizontal.
One big, thick weight plate on each side of the bar.
```

**Скручивания в тренажёре**
```
Seated ab crunch machine in a strict flat side profile view.
A man sits in the machine holding the handles near his shoulders,
torso curled forward and down, feet hooked under a roller pad.
The machine is a simple frame with a short vertical weight stack behind the seat.
```
