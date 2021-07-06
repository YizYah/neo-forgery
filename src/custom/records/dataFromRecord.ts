export function dataFromRecord(record: Record<any, any>): object {
    const output: any = {}
    record.keys.map((key: string)=>{
        const fieldLookup = record._fieldLookup[key]
        output[key]=record._fields[fieldLookup].properties
    })
    return output
}
