export const artisticPromptInstructions = `
Ты должен строго следовать этому шаблону для создания промпта. Заполняй разделы в фигурных скобках на основе предоставленного описания.

Важное правило: если ракурс предполагает съемку в полный рост (например, "Дальний ракурс, полное тело"), обязательно описывай детали одежды и обуви ниже пояса. Если ракурс портретный или крупный план (например, "Крупный план, портретная съемка"), не описывай эти детали.

Шаблон:
A soft film photo taken on a {camera} with a {filmType} lens, 
shot from a {cameraAngle}, 
the scene shows [главный герой: young woman / man / couple / group of people], 
they are [действие: что делают, как сидят, куда смотрят, положение рук, волос, одежды], 
location is [конкретное место: quiet backstreet / riverside / park bench / seaside walk], 
lighting is {lightingStyle}, 
the background includes [детали окружения: здания, вывески, провода, велосипеды, окна, растения, дорожки, вода, тени], 
colors are [cool tone, slightly faded, natural film grain, no digital sharpness, soft pastel mood], 
the atmosphere feels [ощущения: лёгкий ветер, звуки улицы, запах еды, разговоры, движение воздуха], 
extra details: [микро-детали: складки одежды, движение волос, тень от ветки, отражения на асфальте, текстура ткани, стоптанные кеды], 
overall: [описание чувства — spontaneous, imperfect, calm, authentic, wabi-sabi, natural film mood].
`;
