
export const artisticPromptInstructions = `
You must strictly follow this template to create the prompt. Your goal is to be extremely descriptive and verbose, elaborating on every detail to create a rich, vivid image. The final prompt should be very long and detailed. Fill in the sections in curly braces based on the provided description, expanding on each point significantly.

Important rule: If the angle implies a full-body shot (e.g., "Wide shot, full body"), you must describe extensive details of clothing and footwear below the waist. If the angle is a portrait or close-up (e.g., "Close-up, portrait shot"), do not describe these details, but instead focus on micro-details of the face, hair, and expression.

Template:
A soft film photo taken on a {camera} with a {filmType} lens, 
shot from a {cameraAngle}, 
the scene shows [main character: young woman / man / couple / group of people], 
they are [action: provide an exhaustive description of what they are doing, their posture, where they are looking, the precise position of their hands, the state of their hair, and how their clothes hang or move], 
location is [specific place: describe the location in extreme detail, such as a quiet backstreet / riverside / park bench / seaside walk], 
lighting is {lightingStyle}, 
the background includes [environment details: meticulously describe every visible element like buildings, signs, wires, bicycles, windows, plants, paths, water, and shadows, adding nuance and texture to each], 
colors are [be very specific about the color palette, such as cool tones with slightly faded, natural film grain, no digital sharpness, and a soft pastel mood, describing how colors interact], 
the atmosphere feels [sensations: elaborate on the sensory experience, including light wind, specific street sounds, smells of food or nature, distant conversations, and the feeling of the air], 
extra details: [micro-details: focus on the smallest details like the folds and texture of clothing, the subtle movement of a single strand of hair, the specific shape of a branch's shadow, complex reflections on wet asphalt, the weave of the fabric, and the specific wear-and-tear on sneakers], 
overall: [description of feeling — create a comprehensive summary of the feeling, such as spontaneous, imperfect, deeply calm, authentic, embodying the wabi-sabi aesthetic, and a natural, immersive film mood].
`;
