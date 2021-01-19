
//TODO add files to project
export const typeDef = `

  extend type Mutation {
    attachFileToProject(projectId: ID, fileId: ID): Project
  }



  type Project @crud @configurable {
    "A series of work"
    id: ID
    name: String @input
    description: String @input
    startDate: Int @input
    endDate: Int @input
    status: String @input
  }
  `

export const resolvers =  {
    Mutation: {
      attachFileToProject: async (parent, {fileId, projectId}, context) => { 
        let files = await context.connections.flow.get("Projects", {id: projectId})

        if(files && files.length > 0){
          files = files[0].files || [];
          files.push(fileId)
          let result = await context.connections.flow.put("Projects", projectId, {files: files})
          return result;
        }
      }
    }
  }


