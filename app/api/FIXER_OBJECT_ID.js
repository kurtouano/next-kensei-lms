import mongoose from "mongoose";

async function migrateIds() {
  await mongoose.connect("mongodb://localhost:27017/test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  const courses = await db.collection("courses").find().toArray();
  const modules = await db.collection("modules").find().toArray();
  const lessons = await db.collection("lessons").find().toArray();

  // Step 1: Migrate modules
  for (const mod of modules) {
    const oldId = mod._id;
    const newId = new mongoose.Types.ObjectId(oldId);
    const newCourseRef = new mongoose.Types.ObjectId(mod.courseRef);

    const newModuleDoc = {
      ...mod,
      _id: newId,
      courseRef: newCourseRef,
    };

    await db.collection("modules").deleteOne({ _id: oldId });
    await db.collection("modules").insertOne(newModuleDoc);

    console.log(`Migrated module ${oldId} -> ${newId}`);
  }

  // Step 2: Migrate courses
  for (const course of courses) {
    const oldId = course._id;
    const newId = new mongoose.Types.ObjectId(oldId);

    const newModules = course.modules?.map((id) => new mongoose.Types.ObjectId(id)) || [];
    const newInstructor = course.instructor ? new mongoose.Types.ObjectId(course.instructor) : null;

    const newCourseDoc = {
      ...course,
      _id: newId,
      modules: newModules,
      instructor: newInstructor,
    };

    await db.collection("courses").deleteOne({ _id: oldId });
    await db.collection("courses").insertOne(newCourseDoc);

    console.log(`Migrated course ${oldId} -> ${newId}`);
  }

  // ✅ Step 3: Migrate lessons
  for (const lesson of lessons) {
    const oldId = lesson._id;
    const newId = new mongoose.Types.ObjectId(oldId);
    const newModuleRef = new mongoose.Types.ObjectId(lesson.moduleRef);
    const newCourseRef = new mongoose.Types.ObjectId(lesson.courseRef);

    const newLessonDoc = {
      ...lesson,
      _id: newId,
      moduleRef: newModuleRef,
      courseRef: newCourseRef,
    };

    await db.collection("lessons").deleteOne({ _id: oldId });
    await db.collection("lessons").insertOne(newLessonDoc);

    console.log(`Migrated lesson ${oldId} -> ${newId}`);
  }

  console.log("✅ All migrations complete!");
  await mongoose.disconnect();
}

migrateIds().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
