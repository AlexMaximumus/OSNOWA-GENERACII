
export const studioPromptInstructions = `
A soft film photo taken on a {camera} with a {filmType} lens, 
shot from a {cameraAngle}, 
the scene shows [main character: young woman / man / couple / group of people], 
they are [action: what they are doing, how they are sitting, where they are looking, position of hands, hair, clothes], 
location is a clean white studio background, 
lighting is {lightingStyle}, 
the background is only a solid white color, no other environment details should be included.
colors are [cool tone, slightly faded, natural film grain, no digital sharpness, soft pastel mood], 
the atmosphere feels [sensations: studio silence, controlled environment], 
extra details: [micro-details: folds in clothing, movement of hair, fabric texture, worn-out sneakers], 
overall: [description of feeling — clean, minimalist, focused on the character].

Important rules:
1.  The background MUST be a solid, clean white. Do not add any other environment details, objects, or locations.
2.  Do NOT include the character's name in the prompt.
3.  If the angle implies a full-body shot (e.g., "Wide shot, full body"), you must describe details of clothing and footwear below the waist. If the angle is a portrait or close-up (e.g., "Close-up, portrait shot"), do not describe these details.
`;
