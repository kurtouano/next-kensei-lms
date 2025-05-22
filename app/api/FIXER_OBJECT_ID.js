import mongoose from "mongoose";

async function migrateIds() {
  await mongoose.connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  const courses = await db.collection("courses").find().toArray();
  const modules = await db.collection("modules").find().toArray();

  // Step 1: Migrate modules
  for (const mod of modules) {
    const oldId = mod._id;
    const newId = new mongoose.Types.ObjectId(oldId);

    // Convert courseRef string to ObjectId
    const newCourseRef = new mongoose.Types.ObjectId(mod.courseRef);

    // Prepare new module doc
    const newModuleDoc = {
      ...mod,
      _id: newId,
      courseRef: newCourseRef,
    };

    // Delete old doc
    await db.collection("modules").deleteOne({ _id: oldId });

    // Insert new doc
    await db.collection("modules").insertOne(newModuleDoc);

    console.log(`Migrated module ${oldId} -> ${newId}`);
  }

  // Step 2: Migrate courses
  for (const course of courses) {
    const oldId = course._id;
    const newId = new mongoose.Types.ObjectId(oldId);

    // Convert modules array from strings to ObjectIds
    const newModules = course.modules?.map((id) => new mongoose.Types.ObjectId(id)) || [];

    // Convert instructor if needed (assuming it's a string id)
    const newInstructor = course.instructor ? new mongoose.Types.ObjectId(course.instructor) : null;

    // Prepare new course doc
    const newCourseDoc = {
      ...course,
      _id: newId,
      modules: newModules,
      instructor: newInstructor,
    };

    // Delete old doc
    await db.collection("courses").deleteOne({ _id: oldId });

    // Insert new doc
    await db.collection("courses").insertOne(newCourseDoc);

    console.log(`Migrated course ${oldId} -> ${newId}`);
  }

  console.log("Migration complete!");
  await mongoose.disconnect();
}

migrateIds().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
