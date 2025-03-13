export enum ContextOptions {
  SEND_MESSAGE = 'send-message',

  /**
   * @abstract Notify the patient about the appointment
   */
  APPOINTMENT_CREATED = 'appointment-created',

  /**
   * @abstract Confirm presence one day earlier
   */
  CONFIRM_APPOINTMENT = 'confirm-appointment',

  /**
   * @abstract Notify ambulance departure with estimated arrival time
   */
  AMBULANCE_DEPARTURE = 'ambulance-departure',

  /**
   * @abstract Send data and files after the consultation completed
   */
  FINALIZED_APPOINTMENT = 'finalized-appointment',

  /**
   * @abstract Send a simple survey to collect feedback of the consultation
   */
  COLLECT_FEEDBACK = 'collect-feedback',

  NEXT_APPOINTMENTS = 'next-appointments',

  CANCEL_APPOINTMENT = 'cancel-appointment',

  RESCHEDULE_APPOINTMENT = 'reschedule-appointment',

  EXAMS_DONE = 'exams-done',

  MEDICINE_REMINDER = 'prescription-done',

  FAQ = 'faq',
}
