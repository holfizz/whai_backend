import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { FolderInput } from "./dto/create-folder.input";
import { UpdateFolderInput } from "./dto/update-folder.input";
import { Folder } from "./entities/folder.entity";
import { FolderService } from "./folder.service";

@Resolver(() => Folder)
export class FolderResolver {
  constructor(private readonly folderService: FolderService) {}

  @Mutation(() => Folder)
  createFolder(@Args("createFolderInput") createFolderInput: FolderInput) {
    return this.folderService.createFolder(createFolderInput);
  }

  @Mutation(() => Folder)
  updateFolder(@Args("updateFolderInput") updateFolderInput: UpdateFolderInput) {
    return this.folderService.updateFolder(updateFolderInput.id, updateFolderInput);
  }

  @Mutation(() => Folder)
  deleteFolder(@Args("id", { type: () => ID }) id: string) {
    return this.folderService.deleteFolder(id);
  }
}
