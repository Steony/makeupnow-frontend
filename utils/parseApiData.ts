// utils/parseApiData.ts

/**
 * Parse une réponse API qui pourrait être un JSON mal formé
 * Exemples de cas gérés :
 * - chaîne JSON simple (objet ou tableau)
 * - chaîne avec plusieurs objets JSON concaténés (concaténation accidentelle)
 * - chaîne avec JSON dans un tableau ou dans une string imbriquée
 * @param data : la donnée brute reçue de l'API
 * @returns un objet JSON ou tableau JSON bien formé
 */
export function parseApiData(data: any): any {
  if (typeof data === 'string') {
    try {
      // On tente d'abord un parse classique
      return JSON.parse(data);
    } catch {
      // Si ça plante, on cherche un JSON array dans la string
      const matchArray = data.match(/\[.*?\]/s);
      if (matchArray) {
        try {
          return JSON.parse(matchArray[0]);
        } catch {}
      }
      // Sinon, on tente d'isoler le premier JSON objet dans la string
      const matchObject = data.match(/\{.*?\}/s);
      if (matchObject) {
        try {
          return JSON.parse(matchObject[0]);
        } catch {}
      }
    }
  }
  // Si ce n'est pas une string ou que tout a échoué, on renvoie tel quel
  return data;
}
