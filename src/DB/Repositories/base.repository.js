
export default class BaseRepository {

    constructor(model){
        this.model = model;
    }
    
    createDocument(data){
        return this.model.create(data);
    }

    findOneDocument(filters, select={}){
        return this.model.findOne(filters).select(select);
    }

    findDocumentById(id){
        return this.model.findById(id);
    }

    findDocuments(filters, options){
        const  { limit , skip ,  ...otherOptions }= options
        const query  =  this.model.find(filters, otherOptions);
        if(limit && skip) {
            return query.limit(limit).skip(skip)
        }
        return query
    }

    updateDocument({filters , data , options}){
        return this.model.updateOne(filters, data, options);
    }

    updateWithFindOne({filters , data , options}){
        return this.model.findOneAndUpdate(filters, data, options);
    }
    
    updateWithFindById({id, data, options}){
        return this.model.findByIdAndUpdate(id, data, {...options , validator:true});
    }

    updateManyDocuments({filters, data , options}){
        return this.model.updateMany(filters, data, options);
    }

    deleteDocument({filters}){
        return this.model.deleteOne(filters);
    }


    deleteAll(){
        return this.model.deleteMany({});
    }

    deleteWithFindOne({filters}){
        return this.model.findOneAndDelete(filters);
    }

    
    // { new:true, session }
    deleteManyDocuments({ filters , options = {} }){
        const { session , ...otherOptions} = options
        const query = this.model.deleteMany(filters, otherOptions);
        if (session) {
            return query.session(session);
        }
        // this.model.deleteMany(filters, otherOptions).session(session);
        return query;
    }

    deleteWithFindById({ _id , options = {} }){
        const { session , ...otherOptions} = options
        const query = this.model.findByIdAndDelete(_id, otherOptions);
        if (session) {
            return query.session(session);
        }
        return query;
    }

    countDocuments(filters){
        return this.model.countDocuments(filters);
    }
}
