const AppDataSource = require("../config/database");

async function expireReservations() {
  const reservationRepo = AppDataSource.getRepository("Reservation");

  const now = new Date();

  // find expired holds
  const expired = await reservationRepo
    .createQueryBuilder("r")
    .where("r.status = :status", { status: "HELD" })
    .andWhere("r.holdExpiresAt < :now", { now })
    .getMany();

  if (expired.length === 0) return;

  // run as a single transaction
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const rRepo = queryRunner.manager.getRepository("Reservation");
    const eRepo = queryRunner.manager.getRepository("Event");

    for (const r of expired) {
      // restore seats
      const event = await eRepo.findOne({ where: { id: r.eventId } });
      if (event) {
        event.availableSeats = Math.min(event.totalSeats, event.availableSeats + r.qty);
        await eRepo.save(event);
      }

      r.status = "EXPIRED";
      await rRepo.save(r);
    }

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error("expireReservations failed:", err.message);
  } finally {
    await queryRunner.release();
  }
}

function startExpireReservationsJob() {
  // run every 30 seconds (fine for dev)
  setInterval(() => expireReservations().catch(console.error), 30_000);
}

module.exports = { startExpireReservationsJob };
