import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterDiseases'
})
export class FilterDiseasesPipe implements PipeTransform {
  transform(diseases: any[], searchText: string): any[] {
    if (!diseases) return [];
    if (!searchText) return diseases;

    searchText = searchText.toLowerCase();
    return diseases.filter(disease => 
      disease.name.toLowerCase().includes(searchText) ||
      disease.id?.toLowerCase().includes(searchText) ||
      (Array.isArray(disease.synonyms) ? disease.synonyms.join(' ').toLowerCase().includes(searchText) : false) ||
      disease.validatorInfo.organization?.toLowerCase().includes(searchText) ||
      disease.validatorInfo.country?.toLowerCase().includes(searchText)
    );
  }
}
